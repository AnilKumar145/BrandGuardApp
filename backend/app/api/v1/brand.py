import math
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...models.user import User
from ...models.brand import Brand, OfficialSocialAccount, OfficialApp
from ...schemas.brand import (
    BrandCreate, BrandUpdate, BrandResponse, BrandDetailResponse,
    PaginatedBrandsResponse, BrandListItem,
    SocialAccountCreate, SocialAccountResponse,
    AppCreate, AppResponse
)
from ...services.auth_service import get_current_user
from ...services import brand_service

router = APIRouter(prefix="/brands", tags=["Brands"])

@router.post("", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
def create_brand(
    brand_in: BrandCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return brand_service.create_brand(db, current_user.id, brand_in)

@router.get("", response_model=PaginatedBrandsResponse)
def list_brands(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brands = brand_service.get_user_brands(db, current_user.id, page, page_size)
    total = brand_service.count_user_brands(db, current_user.id)
    return {
        "items": brands,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total,
            "total_pages": math.ceil(total / page_size) if total > 0 else 1
        }
    }

@router.get("/{brand_id}", response_model=BrandDetailResponse)
def get_brand(
    brand_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brand = brand_service.get_brand_by_id(db, brand_id, current_user.id)
    social_count = len(brand.official_social_accounts)
    app_count = len(brand.official_apps)
    return BrandDetailResponse(
        id=brand.id,
        name=brand.name,
        normalized_name=brand.normalized_name,
        website=brand.website,
        logo_url=brand.logo_url,
        owner_id=brand.owner_id,
        created_at=brand.created_at,
        updated_at=brand.updated_at,
        official_social_count=social_count,
        official_app_count=app_count
    )

@router.patch("/{brand_id}", response_model=BrandResponse)
def update_brand(
    brand_id: str,
    brand_in: BrandUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return brand_service.update_brand(db, brand_id, current_user.id, brand_in)

@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand(
    brand_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brand_service.delete_brand(db, brand_id, current_user.id)
    return None

# --- Official Social Accounts ---

@router.post("/{brand_id}/social-accounts", response_model=SocialAccountResponse, status_code=status.HTTP_201_CREATED)
def add_social_account(
    brand_id: str,
    soc_in: SocialAccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return brand_service.add_social_account(db, brand_id, current_user.id, soc_in)

@router.get("/{brand_id}/social-accounts", response_model=List[SocialAccountResponse])
def list_social_accounts(
    brand_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brand = brand_service.get_brand_by_id(db, brand_id, current_user.id)
    return brand.official_social_accounts

@router.delete("/{brand_id}/social-accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_social_account(
    brand_id: str,
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brand_service.delete_social_account(db, brand_id, current_user.id, account_id)
    return None

# --- Official Mobile Apps ---

@router.post("/{brand_id}/apps", response_model=AppResponse, status_code=status.HTTP_201_CREATED)
def add_app(
    brand_id: str,
    app_in: AppCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return brand_service.add_official_app(db, brand_id, current_user.id, app_in)

@router.get("/{brand_id}/apps", response_model=List[AppResponse])
def list_apps(
    brand_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brand = brand_service.get_brand_by_id(db, brand_id, current_user.id)
    return brand.official_apps

@router.delete("/{brand_id}/apps/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_app(
    brand_id: str,
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brand_service.delete_official_app(db, brand_id, current_user.id, app_id)
    return None
