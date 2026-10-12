from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.brand import Brand, OfficialSocialAccount, OfficialApp
from ..schemas.brand import BrandCreate, BrandUpdate, SocialAccountCreate, AppCreate

def get_user_brands(db: Session, user_id: str, page: int = 1, page_size: int = 20) -> List[Brand]:
    offset = (page - 1) * page_size
    return db.query(Brand).filter(Brand.owner_id == user_id).offset(offset).limit(page_size).all()

def count_user_brands(db: Session, user_id: str) -> int:
    return db.query(Brand).filter(Brand.owner_id == user_id).count()

def get_brand_by_id(db: Session, brand_id: str, user_id: str) -> Brand:
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error_code": "NOT_FOUND", "message": "Brand not found"}
        )
    if brand.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error_code": "FORBIDDEN", "message": "You do not own this brand"}
        )
    return brand

def create_brand(db: Session, user_id: str, brand_in: BrandCreate) -> Brand:
    normalized = brand_in.name.strip().lower()
    brand = Brand(
        owner_id=user_id,
        name=brand_in.name.strip(),
        normalized_name=normalized,
        website=brand_in.website,
        logo_url=brand_in.logo_url
    )
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand

def update_brand(db: Session, brand_id: str, user_id: str, brand_in: BrandUpdate) -> Brand:
    brand = get_brand_by_id(db, brand_id, user_id)
    if brand_in.name is not None:
        brand.name = brand_in.name.strip()
        brand.normalized_name = brand_in.name.strip().lower()
    if brand_in.website is not None:
        brand.website = brand_in.website
    if brand_in.logo_url is not None:
        brand.logo_url = brand_in.logo_url

    db.commit()
    db.refresh(brand)
    return brand

def delete_brand(db: Session, brand_id: str, user_id: str) -> None:
    brand = get_brand_by_id(db, brand_id, user_id)
    db.delete(brand)
    db.commit()

def add_social_account(db: Session, brand_id: str, user_id: str, soc_in: SocialAccountCreate) -> OfficialSocialAccount:
    brand = get_brand_by_id(db, brand_id, user_id)
    
    # Check duplicate
    clean_handle = soc_in.handle.strip()
    existing = db.query(OfficialSocialAccount).filter(
        OfficialSocialAccount.brand_id == brand_id,
        OfficialSocialAccount.platform == soc_in.platform,
        OfficialSocialAccount.handle == clean_handle
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error_code": "CONFLICT", "message": f"Account '{clean_handle}' already exists for platform '{soc_in.platform}'"}
        )

    soc = OfficialSocialAccount(
        brand_id=brand_id,
        platform=soc_in.platform,
        handle=clean_handle,
        url=soc_in.url,
        is_verified=soc_in.is_verified
    )
    db.add(soc)
    db.commit()
    db.refresh(soc)
    return soc

def delete_social_account(db: Session, brand_id: str, user_id: str, account_id: str) -> None:
    brand = get_brand_by_id(db, brand_id, user_id)
    soc = db.query(OfficialSocialAccount).filter(
        OfficialSocialAccount.id == account_id,
        OfficialSocialAccount.brand_id == brand_id
    ).first()
    if not soc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error_code": "NOT_FOUND", "message": "Social account not found"}
        )
    db.delete(soc)
    db.commit()

def add_official_app(db: Session, brand_id: str, user_id: str, app_in: AppCreate) -> OfficialApp:
    brand = get_brand_by_id(db, brand_id, user_id)
    
    app = OfficialApp(
        brand_id=brand_id,
        name=app_in.name,
        package_id=app_in.package_id,
        developer_name=app_in.developer_name,
        store=app_in.store,
        store_url=app_in.store_url,
        logo_url=app_in.logo_url
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app

def delete_official_app(db: Session, brand_id: str, user_id: str, app_id: str) -> None:
    brand = get_brand_by_id(db, brand_id, user_id)
    app = db.query(OfficialApp).filter(
        OfficialApp.id == app_id,
        OfficialApp.brand_id == brand_id
    ).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error_code": "NOT_FOUND", "message": "Official app not found"}
        )
    db.delete(app)
    db.commit()
