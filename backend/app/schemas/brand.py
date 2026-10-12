from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl

class BrandBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    website: Optional[str] = None
    logo_url: Optional[str] = None

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    website: Optional[str] = None
    logo_url: Optional[str] = None

class BrandResponse(BrandBase):
    id: str
    normalized_name: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BrandDetailResponse(BrandResponse):
    official_social_count: int = 0
    official_app_count: int = 0

class BrandListItem(BaseModel):
    id: str
    name: str
    logo_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedBrandsResponse(BaseModel):
    items: List[BrandListItem]
    pagination: dict

class SocialAccountCreate(BaseModel):
    platform: str = Field(..., description="x | instagram | facebook | linkedin | tiktok | youtube")
    handle: str = Field(..., min_length=1)
    url: Optional[str] = None
    is_verified: bool = False

class SocialAccountResponse(SocialAccountCreate):
    id: str
    brand_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class AppCreate(BaseModel):
    name: str
    package_id: Optional[str] = None
    developer_name: str
    store: str = Field(..., description="google_play | app_store")
    store_url: Optional[str] = None
    logo_url: Optional[str] = None

class AppResponse(AppCreate):
    id: str
    brand_id: str
    created_at: datetime

    class Config:
        from_attributes = True
