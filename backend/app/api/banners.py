from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.firebase import is_firebase_available
from app.services.firebase_db import FirestoreBannerService, DocumentObject
from app.models.models import Banner
from app.models.schemas import BannerCreate, BannerResponse
from app.api.deps import get_current_admin

router = APIRouter(prefix="/banners", tags=["Banners"])

@router.get("", response_model=List[BannerResponse])
async def list_banners(db: AsyncSession = Depends(get_db)):
    if is_firebase_available():
        banners = FirestoreBannerService.list_banners()
        return [DocumentObject(b) for b in banners]

    result = await db.execute(
        select(Banner).where(Banner.is_active == True).order_by(Banner.display_order.asc())
    )
    return result.scalars().all()

@router.post("", response_model=BannerResponse, status_code=status.HTTP_201_CREATED)
async def create_banner(
    banner_in: BannerCreate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if is_firebase_available():
        created = FirestoreBannerService.create_banner(banner_in.dict())
        return DocumentObject(created)

    banner = Banner(**banner_in.dict())
    db.add(banner)
    await db.commit()
    await db.refresh(banner)
    return banner

@router.delete("/{banner_id}")
async def delete_banner(
    banner_id: str,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if is_firebase_available():
        success = FirestoreBannerService.delete_banner(banner_id)
        if not success:
            raise HTTPException(status_code=404, detail="Banner not found")
        return {"message": "Banner deleted successfully"}

    result = await db.execute(select(Banner).where(Banner.id == banner_id))
    banner = result.scalars().first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    await db.delete(banner)
    await db.commit()
    return {"message": "Banner deleted successfully"}
