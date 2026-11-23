from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional, Any

from app.core.database import get_db
from app.core.firebase import is_firebase_available
from app.services.firebase_db import FirestoreReviewService, FirestoreProductService, DocumentObject
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
    if is_firebase_available():
        reviews = FirestoreReviewService.list_reviews_by_product(product_id)
        return [DocumentObject(r) for r in reviews]

    result = await db.execute(
        select(Review)
        .where(Review.product_id == product_id, Review.status == "approved")
        .order_by(desc(Review.created_at))
    )
    return result.scalars().all()

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review(
    review_in: ReviewCreate,
    current_user: Optional[Any] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    customer_name = review_in.customer_name
    user_name = getattr(current_user, "full_name", None) or (current_user.get("full_name") if hasattr(current_user, "get") else None)
    user_id = getattr(current_user, "id", None) or (current_user.get("id") if hasattr(current_user, "get") else None)
    if user_name:
        customer_name = user_name
    if not customer_name:
        customer_name = "Discerning Patron"

    if is_firebase_available():
        prod = FirestoreProductService.get_product(review_in.product_id)
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found")

        r_data = {
            "product_id": review_in.product_id,
            "user_id": user_id,
            "customer_name": customer_name,
            "rating": review_in.rating,
            "title": review_in.title,
            "comment": review_in.comment,
            "verified_purchase": True,
            "status": "approved"
        }
        created = FirestoreReviewService.create_review(r_data)
        return DocumentObject(created)

    prod_res = await db.execute(select(Product).where(Product.id == review_in.product_id))
    prod = prod_res.scalars().first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    review = Review(
        product_id=review_in.product_id,
        user_id=user_id,
        customer_name=customer_name,
        rating=review_in.rating,
        title=review_in.title,
        comment=review_in.comment,
        verified_purchase=True,
        status="approved"
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    await recalculate_product_rating(review_in.product_id, db)
    return review

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if is_firebase_available():
        success = FirestoreReviewService.delete_review(review_id)
        if not success:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"message": "Review deleted successfully"}

    result = await db.execute(select(Review).where(Review.id == review_id))
    rev = result.scalars().first()
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found")
    pid = rev.product_id
    await db.delete(rev)
    await db.commit()
    await recalculate_product_rating(pid, db)
    return {"message": "Review deleted successfully"}
