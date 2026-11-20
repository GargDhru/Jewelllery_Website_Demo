from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.models import Category
from app.models.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.api.deps import get_current_admin

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
async def get_categories(
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db)
):
    query = select(Category).order_by(Category.display_order.asc(), Category.name.asc())
    if not include_inactive:
        query = query.where(Category.is_active == True)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{slug_or_id}", response_model=CategoryResponse)
async def get_category(slug_or_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Category).where(
            (Category.slug == slug_or_id) | (Category.id == slug_or_id)
        )
    )
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    cat_in: CategoryCreate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(Category).where((Category.name == cat_in.name) | (Category.slug == cat_in.slug)))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Category with this name or slug already exists")
    
    cat = Category(**cat_in.dict())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat

@router.put("/{cat_id}", response_model=CategoryResponse)
async def update_category(
    cat_id: str,
    cat_in: CategoryUpdate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Category).where(Category.id == cat_id))
    cat = result.scalars().first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = cat_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cat, field, value)
    
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat

@router.delete("/{cat_id}")
async def delete_category(
    cat_id: str,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Category).where(Category.id == cat_id))
    cat = result.scalars().first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    await db.delete(cat)
    await db.commit()
    return {"message": "Category deleted successfully"}

