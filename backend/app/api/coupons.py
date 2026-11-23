from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from typing import List

from app.core.database import get_db
from app.core.firebase import is_firebase_available
from app.services.firebase_db import FirestoreCouponService, DocumentObject
from app.models.models import Coupon
from app.models.schemas import (
    CouponCreate, CouponResponse, CouponApplyRequest, CouponApplyResponse
)
from app.api.deps import get_current_admin

router = APIRouter(prefix="/coupons", tags=["Coupons & Discounts"])

@router.get("", response_model=List[CouponResponse])
async def list_coupons(db: AsyncSession = Depends(get_db)):
    if is_firebase_available():
        coupons = FirestoreCouponService.list_coupons()
        return [DocumentObject(c) for c in coupons]

    result = await db.execute(select(Coupon).where(Coupon.is_active == True))
    return result.scalars().all()

@router.post("/validate", response_model=CouponApplyResponse)
async def validate_coupon(req: CouponApplyRequest, db: AsyncSession = Depends(get_db)):
    code_clean = req.code.strip().upper()

    if is_firebase_available():
        coupon_data = FirestoreCouponService.get_coupon(code_clean)
        if not coupon_data or not coupon_data.get("is_active", True):
            return CouponApplyResponse(
                valid=False,
                code=code_clean,
                discount_amount=0.0,
                discount_type="none",
                discount_value=0.0,
                message="Invalid coupon code."
            )

        valid_until = coupon_data.get("valid_until")
        if valid_until and isinstance(valid_until, datetime):
            if valid_until.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
                return CouponApplyResponse(
                    valid=False,
                    code=code_clean,
                    discount_amount=0.0,
                    discount_type=coupon_data.get("discount_type", "none"),
                    discount_value=float(coupon_data.get("discount_value", 0.0)),
                    message="This coupon has expired."
                )

        min_purchase = float(coupon_data.get("min_purchase", 0.0))
        if req.subtotal < min_purchase:
            return CouponApplyResponse(
                valid=False,
                code=code_clean,
                discount_amount=0.0,
                discount_type=coupon_data.get("discount_type", "none"),
                discount_value=float(coupon_data.get("discount_value", 0.0)),
                message=f"Minimum purchase amount of ₹{min_purchase:,.0f} required for this coupon."
            )

        disc_val = float(coupon_data.get("discount_value", 0.0))
        max_disc = coupon_data.get("max_discount")
        if coupon_data.get("discount_type") == "percentage":
            discount = (req.subtotal * disc_val) / 100.0
            if max_disc and discount > float(max_disc):
                discount = float(max_disc)
        else:
            discount = min(disc_val, req.subtotal)

        return CouponApplyResponse(
            valid=True,
            code=code_clean,
            discount_amount=round(discount, 2),
            discount_type=coupon_data.get("discount_type", "none"),
            discount_value=disc_val,
            message=f"Coupon {code_clean} applied successfully! You saved ₹{discount:,.2f}"
        )

    # SQLite fallback
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

    if coupon.valid_until and coupon.valid_until.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return CouponApplyResponse(
            valid=False,
            code=code_clean,
            discount_amount=0.0,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            message="This coupon has expired."
        )

    if req.subtotal < coupon.min_purchase:
        return CouponApplyResponse(
            valid=False,
            code=code_clean,
            discount_amount=0.0,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            message=f"Minimum purchase amount of ₹{coupon.min_purchase:,.0f} required for this coupon."
        )

    if coupon.discount_type == "percentage":
        discount = (req.subtotal * coupon.discount_value) / 100.0
        if coupon.max_discount and discount > coupon.max_discount:
            discount = coupon.max_discount
    else:
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
    if is_firebase_available():
        existing = FirestoreCouponService.get_coupon(coupon_in.code)
        if existing:
            raise HTTPException(status_code=400, detail="Coupon code already exists")
        created = FirestoreCouponService.create_coupon(coupon_in.dict())
        return DocumentObject(created)

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
    if is_firebase_available():
        success = FirestoreCouponService.delete_coupon(coupon_id)
        if not success:
            raise HTTPException(status_code=404, detail="Coupon not found")
        return {"message": "Coupon deleted successfully"}

    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalars().first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    await db.delete(coupon)
    await db.commit()
    return {"message": "Coupon deleted successfully"}
