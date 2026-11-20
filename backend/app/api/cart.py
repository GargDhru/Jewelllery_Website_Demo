from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional

from app.core.database import get_db
from app.models.models import Cart, CartItem, Product, ProductVariant
from app.models.schemas import CartItemAdd, CartItemUpdate, CartResponse
from app.api.deps import get_current_user_optional

router = APIRouter(prefix="/cart", tags=["Shopping Cart"])

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
        # re-query with joins
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
    current_user = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    cart = await get_or_create_cart(x_session_id, user_id, db)
    return build_cart_response(cart)

@router.post("/items")
async def add_item_to_cart(
    item_in: CartItemAdd,
    x_session_id: Optional[str] = Header(None),
    current_user = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    cart = await get_or_create_cart(x_session_id, user_id, db)

    # Check product existence & stock
    prod_result = await db.execute(select(Product).where(Product.id == item_in.product_id))
    product = prod_result.scalars().first()
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product is unavailable")
    
    unit_price = product.price

    # Check variant if provided
    if item_in.variant_id:
        v_result = await db.execute(select(ProductVariant).where(ProductVariant.id == item_in.variant_id))
        var = v_result.scalars().first()
        if var and var.price:
            unit_price = var.price

    # Check if item already in cart
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
    # Reload cart
    refreshed_cart = await get_or_create_cart(x_session_id, user_id, db)
    return build_cart_response(refreshed_cart)

@router.put("/items/{item_id}")
async def update_cart_item(
    item_id: str,
    update_in: CartItemUpdate,
    x_session_id: Optional[str] = Header(None),
    current_user = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    cart = await get_or_create_cart(x_session_id, user_id, db)

    item_to_update = None
    for item in cart.items:
        if item.id == item_id:
            item_to_update = item
            break

    if not item_to_update:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    if update_in.quantity <= 0:
        await db.delete(item_to_update)
    else:
        item_to_update.quantity = update_in.quantity
        db.add(item_to_update)

    await db.commit()
    refreshed = await get_or_create_cart(x_session_id, user_id, db)
    return build_cart_response(refreshed)

@router.delete("/items/{item_id}")
async def delete_cart_item(
    item_id: str,
    x_session_id: Optional[str] = Header(None),
    current_user = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    cart = await get_or_create_cart(x_session_id, user_id, db)

    for item in cart.items:
        if item.id == item_id:
            await db.delete(item)
            break

    await db.commit()
    refreshed = await get_or_create_cart(x_session_id, user_id, db)
    return build_cart_response(refreshed)

@router.delete("/clear")
async def clear_cart(
    x_session_id: Optional[str] = Header(None),
    current_user = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    cart = await get_or_create_cart(x_session_id, user_id, db)

    for item in cart.items:
        await db.delete(item)
    await db.commit()

    refreshed = await get_or_create_cart(x_session_id, user_id, db)
    return build_cart_response(refreshed)

