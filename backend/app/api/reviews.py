from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional

from app.core.database import get_db
from app.models.models import Review, Product, User
from app.models.schemas import ReviewCreate, ReviewResponse
from app.api.deps import get_current_user_optional, get_current_admin

router = APIRouter(prefix="/reviews", tags=["Customer Reviews"])

async def recalculate_product_rating(product_id: str, db: AsyncSession):
    rating_res = await db.execute(
        select(
            func.avg(Review.rating),
            func.count(Review.id)
        ).where(Review.product_id == product_id, Review.status == "approved")
    )
    avg_rating, count = rating_res.first()
    
    prod_res = await db.execute(select(Product).where(Product.id == product_id))
    prod = prod_res.scalars().first()
    if prod:
        prod.rating = round(float(avg_rating or 5.0), 1)
        prod.reviews_count = int(count or 0)
        db.add(prod)
        await db.commit()

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(product_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review)
        .where(Review.product_id == product_id, Review.status == "approved")
        .order_by(desc(Review.created_at))
    )
    return result.scalars().all()

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review(
    review_in: ReviewCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    prod_res = await db.execute(select(Product).where(Product.id == review_in.product_id))
    prod = prod_res.scalars().first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    customer_name = review_in.customer_name
    if current_user and current_user.full_name:
        customer_name = current_user.full_name
    if not customer_name:
        customer_name = "Discerning Patron"

    review = Review(
        product_id=review_in.product_id,
        user_id=current_user.id if current_user else None,
        customer_name=customer_name,
        rating=review_in.rating,
        title=review_in.title,
        comment=review_in.comment,
        verified_purchase=True,
        status="approved"  # Auto-approve for instant delight, can be moderated by admin
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    # Recalculate rating
    await recalculate_product_rating(review_in.product_id, db)
    return review

@router.get("/admin/all", response_model=List[ReviewResponse])
async def admin_list_reviews(
    status_filter: Optional[str] = None,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(Review).order_by(desc(Review.created_at))
    if status_filter:
        query = query.where(Review.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()

@router.put("/admin/{review_id}/status")
async def admin_moderate_review(
    review_id: str,
    new_status: str,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if new_status not in ["pending", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.status = new_status
    db.add(review)
    await db.commit()

    await recalculate_product_rating(review.product_id, db)
    return {"message": f"Review marked as {new_status}"}

@router.delete("/admin/{review_id}")
async def admin_delete_review(
    review_id: str,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    prod_id = review.product_id
    await db.delete(review)
    await db.commit()
    await recalculate_product_rating(prod_id, db)
    return {"message": "Review deleted successfully"}

