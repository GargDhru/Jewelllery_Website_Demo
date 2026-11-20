import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.models.models import User, Address
from app.models.schemas import (
    UserRegister, UserLogin, UserResponse, UserUpdate, Token,
    AddressCreate, AddressResponse, ForgotPasswordRequest,
    ResetPasswordRequest, ChangePasswordRequest
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & User"])

def validate_password_strength(password: str):
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    if not any(c.isupper() for c in password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter"
        )
    if not any(c.islower() for c in password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter"
        )
    if not any(c.isdigit() for c in password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number"
        )

@router.post("/register", response_model=Token)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    # 1. Validate mandatory fields
    if not user_in.full_name or not user_in.full_name.strip():
        raise HTTPException(status_code=400, detail="Full Name is compulsory")
    if not user_in.email:
        raise HTTPException(status_code=400, detail="Email Address is compulsory")
    if not user_in.password:
        raise HTTPException(status_code=400, detail="Password is compulsory")

    # 2. Validate password strength
    validate_password_strength(user_in.password)

    # 3. Check duplicate email
    existing = await db.execute(select(User).where(User.email == user_in.email.lower()))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in."
        )
    
    # 4. Create customer user (Role is ALWAYS customer; admin cannot be registered here)
    new_user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name.strip(),
        phone=user_in.phone.strip() if user_in.phone else None,
        role="customer",
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email.lower().strip()))
    user = result.scalars().first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password. Please verify credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if hasattr(user, 'is_active') and not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated by the store administrator. Please contact concierge.",
        )
    
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email.lower().strip()))
    user = result.scalars().first()
    # Always return a clean message so emails cannot be scraped
    return {
        "success": True,
        "message": f"If an account exists with {req.email}, a secure password reset link has been dispatched to your inbox."
    }

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    validate_password_strength(req.new_password)
    result = await db.execute(select(User).where(User.email == req.email.lower().strip()))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")

    user.hashed_password = hash_password(req.new_password)
    db.add(user)
    await db.commit()
    return {"success": True, "message": "Your password has been reset successfully. Please sign in with your new credentials."}

@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="The current password you entered is incorrect")
    
    validate_password_strength(req.new_password)

    current_user.hashed_password = hash_password(req.new_password)
    db.add(current_user)
    await db.commit()
    return {"success": True, "message": "Password changed successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name.strip()
    if user_update.phone is not None:
        current_user.phone = user_update.phone.strip()
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

# Address endpoints
@router.get("/addresses", response_model=List[AddressResponse])
async def list_user_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Address).where(Address.user_id == current_user.id))
    return result.scalars().all()

@router.post("/addresses", response_model=AddressResponse)
async def create_user_address(
    address_in: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if address_in.is_default:
        old_defaults = await db.execute(select(Address).where(Address.user_id == current_user.id, Address.is_default == True))
        for a in old_defaults.scalars().all():
            a.is_default = False
            db.add(a)

    address = Address(
        user_id=current_user.id,
        **address_in.dict()
    )
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address

@router.delete("/addresses/{address_id}")
async def delete_user_address(
    address_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Address).where(Address.id == address_id, Address.user_id == current_user.id))
    address = result.scalars().first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    await db.delete(address)
    await db.commit()
    return {"message": "Address deleted successfully"}
