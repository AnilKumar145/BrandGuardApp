import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from ..db.base import Base

class Brand(Base):
    __tablename__ = "brands"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    normalized_name = Column(String(255), nullable=False, index=True)
    logo_url = Column(Text, nullable=True)
    website = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="brands")
    official_social_accounts = relationship("OfficialSocialAccount", back_populates="brand", cascade="all, delete-orphan")
    official_apps = relationship("OfficialApp", back_populates="brand", cascade="all, delete-orphan")
    detections = relationship("Detection", back_populates="brand", cascade="all, delete-orphan")

class OfficialSocialAccount(Base):
    __tablename__ = "official_social_accounts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_id = Column(String(36), ForeignKey("brands.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    handle = Column(String(255), nullable=False)
    url = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    brand = relationship("Brand", back_populates="official_social_accounts")

    __table_args__ = (
        UniqueConstraint("brand_id", "platform", "handle", name="uq_brand_platform_handle"),
    )

class OfficialApp(Base):
    __tablename__ = "official_apps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_id = Column(String(36), ForeignKey("brands.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    package_id = Column(String(255), nullable=True)
    developer_name = Column(String(255), nullable=False)
    store = Column(String(50), nullable=False)
    store_url = Column(Text, nullable=True)
    logo_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    brand = relationship("Brand", back_populates="official_apps")
