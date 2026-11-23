from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional, Any

from app.core.database import get_db
from app.core.firebase import is_firebase_available
from app.services.firebase_db import (
    FirestoreCartService, FirestoreProductService, DocumentObject
)
from app.models.models import Cart, CartItem, Product, ProductVariant
from app.models.schemas import CartItemAdd, CartItemUpdate, CartResponse
from app.api.deps import get_current_user_optional

router = APIRouter(prefix="/cart", tags=["Shopping Cart"])

def build_firestore_cart_response(cart_dict: dict) -> dict:
    items_res = []
    subtotal = 0.0
    items_count = 0
    raw_items = cart_dict.get("items", [])
    
    for it in raw_items:
        prod_data = FirestoreProductService.get_product(it["product_id"])
        if not prod_data:
            continue
        
        variant_data = None
        unit_price = float(it.get("unit_price") or prod_data.get("price", 0.0))
        if it.get("variant_id") and "variants" in prod_data:
            for v in prod_data["variants"]:
                if v.get("id") == it["variant_id"]:
                    variant_data = v
                    if v.get("price"):
                        unit_price = float(v["price"])
                    break

        qty = int(it.get("quantity", 1))
        tot = qty * unit_price
        subtotal += tot
        items_count += qty

        items_res.append({
            "id": it.get("id"),
            "product_id": it["product_id"],
            "variant_id": it.get("variant_id"),
            "quantity": qty,
            "unit_price": unit_price,
            "total_price": round(tot, 2),
            "product": DocumentObject(prod_data),
            "variant": DocumentObject(variant_data) if variant_data else None
        })

    return {
        "id": cart_dict["id"],
        "items": items_res,
        "subtotal": round(subtotal, 2),
        "items_count": items_count
    }

async def get_or_create_cart(
    session_id: Optional[str],
    user_id: Optional[str],
    db: AsyncSession
) -> Cart:
    cart = None
    if user_id:
        result = await db.execute(
            select(Cart).options(
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.images),
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.variants),
                selectinload(Cart.items).selectinload(CartItem.variant)
            ).where(Cart.user_id == user_id)
        )
        cart = result.scalars().first()

    if not cart and session_id:
        result = await db.execute(
            select(Cart).options(
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.images),
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.variants),
                selectinload(Cart.items).selectinload(CartItem.variant)
            ).where(Cart.session_id == session_id)
        )
        cart = result.scalars().first()

    if not cart:
        cart = Cart(
            user_id=user_id,
            session_id=session_id or "guest_session"
        )
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
        result = await db.execute(
            select(Cart).options(
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.images),
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.variants),
                selectinload(Cart.items).selectinload(CartItem.variant)
            ).where(Cart.id == cart.id)
        )
        cart = result.scalars().first()

    return cart

def build_cart_response(cart: Cart) -> dict:
    items_res = []
    subtotal = 0.0
    items_count = 0
    for item in cart.items:
        if item.product:
            tot = item.quantity * item.unit_price
            subtotal += tot
            items_count += item.quantity
            items_res.append({
                "id": item.id,
                "product_id": item.product_id,
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": tot,
                "product": item.product,
                "variant": item.variant
            })

    return {
        "id": cart.id,
        "items": items_res,
        "subtotal": round(subtotal, 2),
        "items_count": items_count
    }

@router.get("")
async def get_cart(
    x_session_id: Optional[str] = Header(None),
    current_user: Optional[Any] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = getattr(current_user, "id", None) or (current_user.get("id") if hasattr(current_user, "get") else None)

    if is_firebase_available():
        cart_dict = FirestoreCartService.get_or_create_cart(x_session_id, user_id)
        return build_firestore_cart_response(cart_dict)

    cart = await get_or_create_cart(x_session_id, user_id, db)
    return build_cart_response(cart)

@router.post("/items")
async def add_item_to_cart(
    item_in: CartItemAdd,
    x_session_id: Optional[str] = Header(None),
    current_user: Optional[Any] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = getattr(current_user, "id", None) or (current_user.get("id") if hasattr(current_user, "get") else None)

    if is_firebase_available():
        prod_data = FirestoreProductService.get_product(item_in.product_id)
        if not prod_data or not prod_data.get("is_active", True):
            raise HTTPException(status_code=404, detail="Product is unavailable")

        unit_price = float(prod_data.get("price", 0.0))
        if item_in.variant_id and "variants" in prod_data:
            for v in prod_data["variants"]:
                if v.get("id") == item_in.variant_id:
                    if v.get("price"):
                        unit_price = float(v["price"])
                    break

        cart_dict = FirestoreCartService.get_or_create_cart(x_session_id, user_id)
        updated_cart = FirestoreCartService.add_item(cart_dict["id"], {
            "product_id": item_in.product_id,
            "variant_id": item_in.variant_id,
            "quantity": item_in.quantity,
            "unit_price": unit_price
        })
        return build_firestore_cart_response(updated_cart)

    # SQLite fallback
    cart = await get_or_create_cart(x_session_id, user_id, db)
    prod_result = await db.execute(select(Product).where(Product.id == item_in.product_id))
    product = prod_result.scalars().first()
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product is unavailable")
    
    unit_price = product.price
    if item_in.variant_id:
        v_result = await db.execute(select(ProductVariant).where(ProductVariant.id == item_in.variant_id))
        var = v_result.scalars().first()
        if var and var.price:
            unit_price = var.price

    existing_item = None
    for item in cart.items:
        if item.product_id == item_in.product_id and item.variant_id == item_in.variant_id:
            existing_item = item
            break

    if existing_item:
        existing_item.quantity += item_in.quantity
        db.add(existing_item)
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            variant_id=item_in.variant_id,
            quantity=item_in.quantity,
            unit_price=unit_price
        )
        db.add(new_item)

    await db.commit()
    await db.refresh(cart)
    
    result = await db.execute(
        select(Cart).options(
            selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.images),
            selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.variants),
            selectinload(Cart.items).selectinload(CartItem.variant)
        ).where(Cart.id == cart.id)
    )
    return build_cart_response(result.scalars().first())

@router.put("/items/{item_id}")
async def update_cart_item(
    item_id: str,
    item_in: CartItemUpdate,
    x_session_id: Optional[str] = Header(None),
    current_user: Optional[Any] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = getattr(current_user, "id", None) or (current_user.get("id") if hasattr(current_user, "get") else None)

    if is_firebase_available():
        cart_dict = FirestoreCartService.get_or_create_cart(x_session_id, user_id)
        updated = FirestoreCartService.update_item_quantity(cart_dict["id"], item_id, item_in.quantity)
        return build_firestore_cart_response(updated)

    result = await db.execute(select(CartItem).where(CartItem.id == item_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if item_in.quantity <= 0:
        await db.delete(item)
    else:
        item.quantity = item_in.quantity
        db.add(item)
    await db.commit()

    cart = await get_or_create_cart(x_session_id, user_id, db)
    return build_cart_response(cart)

@router.delete("/items/{item_id}")
async def remove_cart_item(
    item_id: str,
    x_session_id: Optional[str] = Header(None),
    current_user: Optional[Any] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = getattr(current_user, "id", None) or (current_user.get("id") if hasattr(current_user, "get") else None)

    if is_firebase_available():
        cart_dict = FirestoreCartService.get_or_create_cart(x_session_id, user_id)
        updated = FirestoreCartService.remove_item(cart_dict["id"], item_id)
        return build_firestore_cart_response(updated)

    result = await db.execute(select(CartItem).where(CartItem.id == item_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.delete(item)
    await db.commit()

    cart = await get_or_create_cart(x_session_id, user_id, db)
    return build_cart_response(cart)

@router.delete("/clear")
async def clear_cart(
    x_session_id: Optional[str] = Header(None),
    current_user: Optional[Any] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = getattr(current_user, "id", None) or (current_user.get("id") if hasattr(current_user, "get") else None)

    if is_firebase_available():
        cart_dict = FirestoreCartService.get_or_create_cart(x_session_id, user_id)
        FirestoreCartService.clear_cart(cart_dict["id"])
        return {"message": "Cart cleared successfully"}

    cart = await get_or_create_cart(x_session_id, user_id, db)
    for item in cart.items:
        await db.delete(item)
    await db.commit()
    return {"message": "Cart cleared successfully"}
