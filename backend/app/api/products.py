from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc, asc, func
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.core.database import get_db
from app.core.firebase import is_firebase_available
from app.services.firebase_db import (
    FirestoreProductService, FirestoreCategoryService, DocumentObject
)
from app.models.models import Product, ProductImage, ProductVariant, Category
from app.models.schemas import (
    ProductCreate, ProductUpdate, ProductResponse
)
from app.api.deps import get_current_admin

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    color: Optional[str] = None,
    material: Optional[str] = None,
    in_stock: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    is_trending: Optional[bool] = None,
    is_new_arrival: Optional[bool] = None,
    sort: Optional[str] = "featured",
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    if is_firebase_available():
        prods = FirestoreProductService.list_products(
            category=category,
            search=search,
            min_price=min_price,
            max_price=max_price,
            color=color,
            material=material,
            in_stock=in_stock,
            is_featured=is_featured,
            is_trending=is_trending,
            is_new_arrival=is_new_arrival,
            sort=sort,
            skip=skip,
            limit=limit
        )
        return [DocumentObject(p) for p in prods]

    # SQLite fallback
    query = select(Product).options(
        selectinload(Product.images),
        selectinload(Product.variants),
        selectinload(Product.category)
    ).where(Product.is_active == True)

    if category:
        if category in ("new-arrivals", "new_arrivals"):
            query = query.where(Product.is_new_arrival == True)
        elif category in ("best-sellers", "best_sellers", "bestselling"):
            query = query.where(or_(Product.is_trending == True, Product.is_featured == True, Product.rating >= 4.9))
        else:
            cat_result = await db.execute(
                select(Category).where((Category.slug == category) | (Category.id == category) | (Category.name == category))
            )
            cat_obj = cat_result.scalars().first()
            if cat_obj:
                query = query.where(Product.category_id == cat_obj.id)

    if search:
        term = f"%{search.lower()}%"
        query = query.where(
            or_(
                func.lower(Product.title).like(term),
                func.lower(Product.description).like(term),
                func.lower(Product.material).like(term),
                func.lower(Product.sku).like(term),
                func.lower(Product.color).like(term)
            )
        )

    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)

    if color:
        query = query.where(func.lower(Product.color).like(f"%{color.lower()}%"))
    if material:
        query = query.where(func.lower(Product.material).like(f"%{material.lower()}%"))
    if in_stock is True:
        query = query.where(Product.stock_quantity > 0)

    if is_featured is not None:
        query = query.where(Product.is_featured == is_featured)
    if is_trending is not None:
        query = query.where(Product.is_trending == is_trending)
    if is_new_arrival is not None:
        query = query.where(Product.is_new_arrival == is_new_arrival)

    if sort == "newest":
        query = query.order_by(desc(Product.created_at))
    elif sort == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort == "rating":
        query = query.order_by(desc(Product.rating))
    elif sort == "bestselling":
        query = query.order_by(desc(Product.reviews_count), desc(Product.rating))
    else:
        query = query.order_by(desc(Product.is_featured), desc(Product.rating), desc(Product.created_at))

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{slug_or_id}", response_model=ProductResponse)
async def get_product(slug_or_id: str, db: AsyncSession = Depends(get_db)):
    if is_firebase_available():
        prod = FirestoreProductService.get_product(slug_or_id)
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found")
        return DocumentObject(prod)

    query = select(Product).options(
        selectinload(Product.images),
        selectinload(Product.variants),
        selectinload(Product.category)
    ).where(
        (Product.slug == slug_or_id) | (Product.id == slug_or_id)
    )
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    prod_in: ProductCreate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if is_firebase_available():
        existing = FirestoreProductService.get_product(prod_in.slug) or FirestoreProductService.get_product(prod_in.sku)
        if existing:
            raise HTTPException(status_code=400, detail="Product with this SKU or slug already exists")
        data = prod_in.dict()
        created = FirestoreProductService.create_product(data)
        return DocumentObject(created)

    existing = await db.execute(select(Product).where((Product.slug == prod_in.slug) | (Product.sku == prod_in.sku)))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Product with this SKU or slug already exists")

    prod_data = prod_in.dict(exclude={"images", "variants"})
    product = Product(**prod_data)
    db.add(product)
    await db.flush()

    for idx, img_url in enumerate(prod_in.images):
        img = ProductImage(
            product_id=product.id,
            image_url=img_url,
            alt_text=f"{product.title} image {idx+1}",
            display_order=idx,
            is_primary=(idx == 0)
        )
        db.add(img)

    for v in prod_in.variants:
        var = ProductVariant(
            product_id=product.id,
            title=v.title,
            sku=v.sku or f"{product.sku}-{v.title[:3].upper()}",
            color=v.color,
            size=v.size,
            price=v.price or product.price,
            stock_quantity=v.stock_quantity or product.stock_quantity,
            is_active=v.is_active
        )
        db.add(var)

    await db.commit()
    
    reloaded = await db.execute(
        select(Product).options(
            selectinload(Product.images),
            selectinload(Product.variants),
            selectinload(Product.category)
        ).where(Product.id == product.id)
    )
    return reloaded.scalars().first()

@router.put("/{prod_id}", response_model=ProductResponse)
async def update_product(
    prod_id: str,
    prod_in: ProductUpdate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if is_firebase_available():
        data = prod_in.dict(exclude_unset=True)
        updated = FirestoreProductService.update_product(prod_id, data)
        if not updated:
            raise HTTPException(status_code=404, detail="Product not found")
        return DocumentObject(updated)

    result = await db.execute(
        select(Product).options(
            selectinload(Product.images),
            selectinload(Product.variants),
            selectinload(Product.category)
        ).where(Product.id == prod_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_dict = prod_in.dict(exclude_unset=True, exclude={"images"})
    for field, val in update_dict.items():
        setattr(product, field, val)

    if prod_in.images is not None:
        old_imgs = await db.execute(select(ProductImage).where(ProductImage.product_id == prod_id))
        for img in old_imgs.scalars().all():
            await db.delete(img)
        for idx, img_url in enumerate(prod_in.images):
            img = ProductImage(
                product_id=product.id,
                image_url=img_url,
                alt_text=f"{product.title} image {idx+1}",
                display_order=idx,
                is_primary=(idx == 0)
            )
            db.add(img)

    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{prod_id}")
async def delete_product(
    prod_id: str,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if is_firebase_available():
        success = FirestoreProductService.delete_product(prod_id)
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}

    result = await db.execute(select(Product).where(Product.id == prod_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted successfully"}
