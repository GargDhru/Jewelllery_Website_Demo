from typing import Optional, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.firebase import is_firebase_available
from app.services.firebase_db import FirestoreUserService, DocumentObject
from app.models.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

async def get_current_user_optional(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Any | None:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None

    # Firebase Firestore
    if is_firebase_available():
        user_data = FirestoreUserService.get_user_by_id(user_id)
        if user_data:
            return DocumentObject(user_data)
        return None

    # SQLite fallback
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    return user

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Any:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception

    # Firebase Firestore
    if is_firebase_available():
        user_data = FirestoreUserService.get_user_by_id(user_id)
        if not user_data:
            raise credentials_exception
        return DocumentObject(user_data)

    # SQLite fallback
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise credentials_exception
    return user

async def get_current_admin(
    current_user: Any = Depends(get_current_user)
) -> Any:
    role = getattr(current_user, "role", None) or (current_user.get("role") if hasattr(current_user, "get") else None)
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have administrative privileges"
        )
    return current_user
