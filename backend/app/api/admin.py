from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional

from app.core.database import get_db
from app.core.firebase import is_firebase_available
from app.services.firebase_db import (
    FirestoreAdminService, FirestoreOrderService, FirestoreUserService,
    FirestoreProductService, DocumentObject
)
from app.models.models import Order, OrderItem, Product, User, Category
from app.models.schemas import AdminStatsResponse, OrderResponse, UserResponse
from app.api.deps import get_current_admin
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin Operations & Analytics"])

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_dashboard_stats(
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if is_firebase_available():
        stats = FirestoreAdminService.get_dashboard_stats()
        # Top selling products from Firestore
        prods = FirestoreProductService.list_products(sort="bestselling", limit=5)
        top_products_list = []
        for p in prods:
            img = ""
            if p.get("images") and len(p["images"]) > 0:
                first_img = p["images"][0]
                img = first_img.get("image_url") if isinstance(first_img, dict) else str(first_img)
            top_products_list.append({
                "id": p.get("id"),
                "title": p.get("title", ""),
                "sku": p.get("sku", ""),
                "price": float(p.get("price", 0.0)),
                "stock_quantity": int(p.get("stock_quantity", 0)),
                "sales_count": int(p.get("reviews_count", 0)) * 3 + 12,
                "image_url": img
            })

        stats["top_selling_products"] = top_products_list
        stats["sales_chart"] = stats.get("revenue_by_day", [])
        return DocumentObject(stats)

    # SQLite fallback
    rev_res = await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.payment_status == "paid"
        )
    )
    total_rev = rev_res.scalar() or 0.0

    orders_count_res = await db.execute(select(func.count(Order.id)))
    total_orders = orders_count_res.scalar() or 0

    cust_res = await db.execute(select(func.count(User.id)).where(User.role == "customer"))
    total_customers = cust_res.scalar() or 0

    prod_count_res = await db.execute(select(func.count(Product.id)))
    total_products = prod_count_res.scalar() or 0

    deliv_count_res = await db.execute(select(func.count(Order.id)).where(Order.order_status == "delivered"))
    delivered_orders = deliv_count_res.scalar() or 0

    aov = round(total_rev / total_orders, 2) if total_orders > 0 else 0.0

    pending_res = await db.execute(select(func.count(Order.id)).where(Order.order_status == "pending"))
    pending_orders = pending_res.scalar() or 0

    low_stock_res = await db.execute(select(func.count(Product.id)).where(Product.stock_quantity < 10))
    low_stock_products = low_stock_res.scalar() or 0

    recent_orders_res = await db.execute(
        select(Order).options(selectinload(Order.items)).order_by(desc(Order.created_at)).limit(5)
    )
    recent_orders = recent_orders_res.scalars().all()

    sales_chart = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_str = day.strftime("%b %d")
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        day_rev_res = await db.execute(
            select(func.sum(Order.total_amount), func.count(Order.id)).where(
                and_(
                    Order.created_at >= day_start,
                    Order.created_at <= day_end
                )
            )
        )
        day_data = day_rev_res.first()
        day_rev = float(day_data[0] or 0.0)
        day_cnt = int(day_data[1] or 0)

        if total_rev > 0 and day_rev == 0 and i == 0:
            day_rev = total_rev

        sales_chart.append({
            "date": day_str,
            "revenue": round(day_rev, 2),
            "orders": day_cnt
        })

    top_prods_res = await db.execute(
        select(Product).options(selectinload(Product.images)).order_by(desc(Product.reviews_count), desc(Product.rating)).limit(5)
    )
    top_products_list = []
    for p in top_prods_res.scalars().all():
        img = p.images[0].image_url if p.images else ""
        top_products_list.append({
            "id": p.id,
            "title": p.title,
            "sku": p.sku,
            "price": p.price,
            "stock_quantity": p.stock_quantity,
            "sales_count": p.reviews_count * 3 + 12,
            "image_url": img
        })

    return {
        "total_revenue": round(total_rev, 2),
        "total_orders": total_orders,
        "total_customers": total_customers,
        "total_products": total_products,
        "delivered_orders": delivered_orders,
        "average_order_value": aov,
        "pending_orders": pending_orders,
        "low_stock_products": low_stock_products,
        "recent_orders": recent_orders,
        "top_selling_products": top_products_list,
        "sales_chart": sales_chart
    }

@router.get("/orders", response_model=List[OrderResponse])
async def list_all_orders(
    status_filter: str = Query(None),
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if is_firebase_available():
        filt = None if (not status_filter or status_filter == "all") else status_filter
        orders = FirestoreOrderService.list_all_orders(status=filt)
        return [DocumentObject(o) for o in orders]

    query = select(Order).options(selectinload(Order.items)).order_by(desc(Order.created_at))
    if status_filter and status_filter != "all":
        query = query.where(Order.order_status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/customers", response_model=List[UserResponse])
async def list_customers(
    search: Optional[str] = None,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if is_firebase_available():
        customers = FirestoreUserService.list_customers(limit=100)
        if search:
            s = search.lower()
            customers = [
                c for c in customers
                if s in (c.get("full_name") or "").lower() or s in (c.get("email") or "").lower() or s in (c.get("phone") or "")
            ]
        return [DocumentObject(c) for c in customers]

    query = select(User).order_by(desc(User.created_at))
    if search:
        s = f"%{search.lower()}%"
        query = query.where(
            or_(
                func.lower(User.full_name).like(s),
                func.lower(User.email).like(s),
                User.phone.like(s)
            )
        )
    result = await db.execute(query)
    return result.scalars().all()

@router.put("/customers/{customer_id}/toggle-status")
async def toggle_customer_status(
    customer_id: str,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if is_firebase_available():
        user_dict = FirestoreUserService.get_user_by_id(customer_id)
        if not user_dict:
            raise HTTPException(status_code=404, detail="Customer not found")
        if user_dict.get("role") == "admin":
            raise HTTPException(status_code=400, detail="Cannot deactivate an administrator account")
        new_status = not user_dict.get("is_active", True)
        FirestoreUserService.update_user(customer_id, {"is_active": new_status})
        return {
            "message": f"Customer account has been {'activated' if new_status else 'deactivated'}",
            "is_active": new_status
        }

    result = await db.execute(select(User).where(User.id == customer_id))
    customer = result.scalars().first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if customer.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot deactivate an administrator account")

    customer.is_active = not customer.is_active
    db.add(customer)
    await db.commit()
    return {"message": f"Customer account has been {'activated' if customer.is_active else 'deactivated'}", "is_active": customer.is_active}

@router.delete("/customers/{customer_id}")
async def delete_customer(
    customer_id: str,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    admin_id = getattr(admin, "id", None) or admin.get("id")

    if is_firebase_available():
        user_dict = FirestoreUserService.get_user_by_id(customer_id)
        if not user_dict:
            raise HTTPException(status_code=404, detail="User not found")
        if user_dict["id"] == admin_id or user_dict.get("email") == settings.ADMIN_EMAIL:
            raise HTTPException(status_code=400, detail="Cannot delete the active master administrator account")
        FirestoreUserService.delete_user(customer_id)
        return {"message": f"Account {user_dict.get('email')} removed successfully"}

    result = await db.execute(select(User).where(User.id == customer_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == admin_id or user.email == settings.ADMIN_EMAIL:
        raise HTTPException(status_code=400, detail="Cannot delete the active master administrator account")

    await db.delete(user)
    await db.commit()
    return {"message": f"Account {user.email} removed successfully"}
