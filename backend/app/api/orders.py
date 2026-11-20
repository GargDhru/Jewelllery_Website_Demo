import random
import string
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.core.database import get_db
from app.models.models import (
    Order, OrderItem, Product, ProductVariant, Coupon, Payment, User, Return
)
from app.models.schemas import (
    CheckoutRequest, OrderResponse, OrderStatusUpdate,
    RazorpayVerifyRequest, PaymentResponse
)
from app.api.deps import get_current_user_optional, get_current_user, get_current_admin
from app.services.razorpay_service import create_razorpay_order, verify_razorpay_signature
from app.core.config import settings

router = APIRouter(prefix="/orders", tags=["Orders & Checkout"])

def generate_order_number() -> str:
    timestamp = datetime.now().strftime("%y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"AURA-{timestamp}-{random_str}"

@router.post("/checkout", response_model=OrderResponse)
async def checkout(
    checkout_in: CheckoutRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    if not checkout_in.items:
        raise HTTPException(status_code=400, detail="Checkout items cannot be empty")

    # 1. Server-side validation of products, variants, and calculation of subtotal
    subtotal = 0.0
    validated_items = []

    for item in checkout_in.items:
        prod_result = await db.execute(select(Product).where(Product.id == item.product_id))
        prod = prod_result.scalars().first()
        if not prod or not prod.is_active:
            raise HTTPException(status_code=400, detail=f"Product is no longer available")

        # Check stock
        if prod.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{prod.title}'. Only {prod.stock_quantity} available."
            )

        unit_price = prod.price
        variant_title = None
        sku = prod.sku

        if item.variant_id:
            var_result = await db.execute(select(ProductVariant).where(ProductVariant.id == item.variant_id))
            var = var_result.scalars().first()
            if var:
                if var.price:
                    unit_price = var.price
                variant_title = var.title
                if var.sku:
                    sku = var.sku

        item_total = unit_price * item.quantity
        subtotal += item_total

        # primary image
        img_result = await db.execute(
            select(Product).options(selectinload(Product.images)).where(Product.id == prod.id)
        )
        p_loaded = img_result.scalars().first()
        primary_img = p_loaded.images[0].image_url if p_loaded and p_loaded.images else ""

        validated_items.append({
            "product": prod,
            "product_id": prod.id,
            "variant_id": item.variant_id,
            "product_title": prod.title,
            "variant_title": variant_title,
            "sku": sku,
            "unit_price": unit_price,
            "quantity": item.quantity,
            "total_price": item_total,
            "image_url": primary_img
        })

    # 2. Coupon discount calculation
    discount_amount = 0.0
    applied_coupon_code = None

    if checkout_in.coupon_code:
        code_clean = checkout_in.coupon_code.strip().upper()
        c_result = await db.execute(select(Coupon).where(Coupon.code == code_clean, Coupon.is_active == True))
        coupon = c_result.scalars().first()
        if coupon:
            # Check conditions
            if not coupon.valid_until or coupon.valid_until.replace(tzinfo=timezone.utc) >= datetime.now(timezone.utc):
                if subtotal >= coupon.min_purchase:
                    applied_coupon_code = coupon.code
                    if coupon.discount_type == "percentage":
                        discount_amount = (subtotal * coupon.discount_value) / 100.0
                        if coupon.max_discount and discount_amount > coupon.max_discount:
                            discount_amount = coupon.max_discount
                    else:
                        discount_amount = min(coupon.discount_value, subtotal)
                    coupon.usage_count += 1
                    db.add(coupon)

    # 3. Shipping fee calculation
    # Free insured delivery above ₹1,999, else ₹149 standard. Express is ₹199.
    shipping_fee = 0.0
    if checkout_in.shipping_method == "express":
        shipping_fee = 199.0
    else:
        if subtotal - discount_amount < 1999.0:
            shipping_fee = 149.0
        else:
            shipping_fee = 0.0

    # 4. Tax (GST 3% for jewellery in India)
    taxable_subtotal = max(0.0, subtotal - discount_amount)
    tax_amount = round(taxable_subtotal * 0.03, 2)

    total_amount = round(taxable_subtotal + tax_amount + shipping_fee, 2)

    # 5. Create Order
    order_num = generate_order_number()
    order_status = "confirmed" if checkout_in.payment_method == "cod" else "pending"
    payment_status = "pending"

    new_order = Order(
        order_number=order_num,
        user_id=current_user.id if current_user else None,
        customer_email=checkout_in.customer_email,
        customer_phone=checkout_in.customer_phone,
        shipping_address=checkout_in.shipping_address,
        billing_address=checkout_in.billing_address or checkout_in.shipping_address,
        subtotal=round(subtotal, 2),
        discount_amount=round(discount_amount, 2),
        coupon_code=applied_coupon_code,
        shipping_fee=round(shipping_fee, 2),
        tax_amount=tax_amount,
        total_amount=total_amount,
        order_status=order_status,
        payment_status=payment_status,
        payment_method=checkout_in.payment_method,
        notes=checkout_in.notes
    )
    db.add(new_order)
    await db.flush()

    # 6. Create Order Items & Decrement Stock
    for v_item in validated_items:
        prod_obj = v_item["product"]
        # reduce stock
        prod_obj.stock_quantity = max(0, prod_obj.stock_quantity - v_item["quantity"])
        db.add(prod_obj)

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=v_item["product_id"],
            variant_id=v_item["variant_id"],
            product_title=v_item["product_title"],
            variant_title=v_item["variant_title"],
            sku=v_item["sku"],
            unit_price=v_item["unit_price"],
            quantity=v_item["quantity"],
            total_price=v_item["total_price"],
            image_url=v_item["image_url"]
        )
        db.add(order_item)

    # 7. Initialize Razorpay Order if payment_method == 'razorpay'
    rzp_order_id = None
    if checkout_in.payment_method == "razorpay":
        rzp_order = create_razorpay_order(
            amount_in_inr=total_amount,
            receipt_id=new_order.order_number,
            notes={"order_id": new_order.id, "email": new_order.customer_email}
        )
        rzp_order_id = rzp_order.get("id")

        payment_entry = Payment(
            order_id=new_order.id,
            razorpay_order_id=rzp_order_id,
            amount=total_amount,
            currency="INR",
            status="pending",
            payment_method="razorpay"
        )
        db.add(payment_entry)

    await db.commit()

    # Reload order with items
    order_reloaded = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == new_order.id)
    )
    res_order = order_reloaded.scalars().first()

    # Attach razorpay_order_id to response
    res_dict = {
        "id": res_order.id,
        "order_number": res_order.order_number,
        "user_id": res_order.user_id,
        "customer_email": res_order.customer_email,
        "customer_phone": res_order.customer_phone,
        "shipping_address": res_order.shipping_address,
        "billing_address": res_order.billing_address,
        "subtotal": res_order.subtotal,
        "discount_amount": res_order.discount_amount,
        "coupon_code": res_order.coupon_code,
        "shipping_fee": res_order.shipping_fee,
        "tax_amount": res_order.tax_amount,
        "total_amount": res_order.total_amount,
        "order_status": res_order.order_status,
        "payment_status": res_order.payment_status,
        "payment_method": res_order.payment_method,
        "tracking_number": res_order.tracking_number,
        "courier_name": res_order.courier_name,
        "notes": res_order.notes,
        "cancelled_reason": res_order.cancelled_reason,
        "created_at": res_order.created_at,
        "items": res_order.items,
        "razorpay_order_id": rzp_order_id
    }
    return res_dict

@router.post("/verify-payment", response_model=PaymentResponse)
async def verify_payment(
    verify_in: RazorpayVerifyRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).options(selectinload(Order.payments)).where(Order.id == verify_in.order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify signature
    is_valid = verify_razorpay_signature(
        razorpay_order_id=verify_in.razorpay_order_id,
        razorpay_payment_id=verify_in.razorpay_payment_id,
        razorpay_signature=verify_in.razorpay_signature
    )

    if not is_valid:
        order.payment_status = "failed"
        db.add(order)
        await db.commit()
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Update payment & order
    order.payment_status = "paid"
    order.order_status = "confirmed"

    # Update or add payment record
    pay_res = await db.execute(select(Payment).where(Payment.order_id == order.id))
    payment = pay_res.scalars().first()
    if payment:
        payment.razorpay_payment_id = verify_in.razorpay_payment_id
        payment.razorpay_signature = verify_in.razorpay_signature
        payment.status = "successful"
        db.add(payment)
    else:
        new_pay = Payment(
            order_id=order.id,
            razorpay_order_id=verify_in.razorpay_order_id,
            razorpay_payment_id=verify_in.razorpay_payment_id,
            razorpay_signature=verify_in.razorpay_signature,
            amount=order.total_amount,
            status="successful"
        )
        db.add(new_pay)

    db.add(order)
    await db.commit()

    return PaymentResponse(
        success=True,
        message="Payment verified and order confirmed successfully!",
        order_id=order.id,
        payment_status="paid"
    )

@router.get("/my-orders", response_model=List[OrderResponse])
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).options(selectinload(Order.items))
        .where(Order.user_id == current_user.id)
        .order_by(desc(Order.created_at))
    )
    return result.scalars().all()

@router.get("/{order_id_or_number}", response_model=OrderResponse)
async def get_order_by_id_or_number(
    order_id_or_number: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(
            (Order.id == order_id_or_number) | (Order.order_number == order_id_or_number)
        )
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    reason: str = "Customer requested cancellation",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

    if order.order_status in ["shipped", "delivered"]:
        raise HTTPException(status_code=400, detail="Cannot cancel an order that has already been shipped or delivered")

    order.order_status = "cancelled"
    order.cancelled_reason = reason

    # Restock inventory
    for item in order.items:
        if item.product_id:
            p_res = await db.execute(select(Product).where(Product.id == item.product_id))
            prod = p_res.scalars().first()
            if prod:
                prod.stock_quantity += item.quantity
                db.add(prod)

    db.add(order)
    await db.commit()
    return {"message": "Order cancelled successfully", "order_status": "cancelled"}

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if status_update.order_status:
        order.order_status = status_update.order_status
    if status_update.payment_status:
        order.payment_status = status_update.payment_status
    if status_update.tracking_number:
        order.tracking_number = status_update.tracking_number
    if status_update.courier_name:
        order.courier_name = status_update.courier_name
    if status_update.cancelled_reason:
        order.cancelled_reason = status_update.cancelled_reason

    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order

class ReturnRequest(BaseModel):
    reason: str

@router.get("/my-returns")
async def get_my_returns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Return)
        .where(Return.user_id == current_user.id)
        .order_by(desc(Return.created_at))
    )
    returns = result.scalars().all()
    return [
        {
            "id": r.id,
            "order_id": r.order_id,
            "reason": r.reason,
            "status": r.status,
            "refund_amount": r.refund_amount,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in returns
    ]

@router.post("/{order_id}/return")
async def request_order_return(
    order_id: str,
    body: ReturnRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check order is delivered (only delivered orders can be returned)
    if order.order_status not in ("delivered", "shipped"):
        raise HTTPException(status_code=400, detail="Return requests can only be submitted for delivered orders.")

    new_return = Return(
        order_id=order.id,
        user_id=current_user.id,
        reason=body.reason,
        status="requested",
        refund_amount=order.total_amount
    )
    db.add(new_return)
    await db.commit()
    return {"message": "Return request submitted successfully. Our atelier concierge will contact you within 24 hours.", "status": "requested"}

@router.get("/returns/all")
async def admin_list_returns(
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Return).order_by(desc(Return.created_at)))
    returns = result.scalars().all()
    return [
        {
            "id": r.id,
            "order_id": r.order_id,
            "user_id": r.user_id,
            "reason": r.reason,
            "status": r.status,
            "refund_amount": r.refund_amount,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in returns
    ]


