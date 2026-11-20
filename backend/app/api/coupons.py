from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from typing import List

from app.core.database import get_db
from app.models.models import Coupon
from app.models.schemas import (
    CouponCreate, CouponResponse, CouponApplyRequest, CouponApplyResponse
)
from app.api.deps import get_current_admin

router = APIRouter(prefix="/coupons", tags=["Coupons & Discounts"])

@router.get("", response_model=List[CouponResponse])
async def list_coupons(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Coupon).where(Coupon.is_active == True))
    return result.scalars().all()

@router.post("/validate", response_model=CouponApplyResponse)
async def validate_coupon(req: CouponApplyRequest, db: AsyncSession = Depends(get_db)):
    code_clean = req.code.strip().upper()
    result = await db.execute(select(Coupon).where(Coupon.code == code_clean, Coupon.is_active == True))
    coupon = result.scalars().first()

    if not coupon:
        return CouponApplyResponse(
            valid=False,
            code=code_clean,
            discount_amount=0.0,
            discount_type="none",
            discount_value=0.0,
            message="Invalid coupon code."
        )

    # Check expiry
    if coupon.valid_until and coupon.valid_until.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return CouponApplyResponse(
            valid=False,
            code=code_clean,
            discount_amount=0.0,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            message="This coupon has expired."
        )

    # Check minimum purchase
    if req.subtotal < coupon.min_purchase:
        return CouponApplyResponse(
            valid=False,
            code=code_clean,
            discount_amount=0.0,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            message=f"Minimum purchase amount of ₹{coupon.min_purchase:,.0f} required for this coupon."
        )

    # Calculate discount
    if coupon.discount_type == "percentage":
        discount = (req.subtotal * coupon.discount_value) / 100.0
        if coupon.max_discount and discount > coupon.max_discount:
            discount = coupon.max_discount
    else:  # flat
        discount = min(coupon.discount_value, req.subtotal)

    return CouponApplyResponse(
        valid=True,
        code=code_clean,
        discount_amount=round(discount, 2),
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        message=f"Coupon {code_clean} applied successfully! You saved ₹{discount:,.2f}"
    )

@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    coupon_in: CouponCreate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(Coupon).where(Coupon.code == coupon_in.code.upper()))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    coupon = Coupon(
        **coupon_in.dict(exclude={"code"}),
        code=coupon_in.code.upper()
    )
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon

@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: str,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalars().first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    await db.delete(coupon)
    await db.commit()
    return {"message": "Coupon deleted successfully"}

