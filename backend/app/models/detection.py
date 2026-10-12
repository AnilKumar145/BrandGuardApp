import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Numeric, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..db.base import Base

class Detection(Base):
    __tablename__ = "detections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_id = Column(String(36), ForeignKey("brands.id", ondelete="CASCADE"), nullable=False, index=True)
    source_type = Column(String(50), nullable=False, index=True)  # 'social' | 'app_store'
    platform = Column(String(50), nullable=False, index=True)     # 'x', 'instagram', 'google_play', etc.
    title = Column(String(512), nullable=False)
    url = Column(Text, nullable=True)
    handle_or_package = Column(String(255), nullable=True)
    developer_or_owner = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(Text, nullable=True)
    risk_score = Column(Numeric(5, 2), nullable=False, index=True)
    risk_level = Column(String(20), nullable=False)  # 'high', 'medium', 'low'
    status = Column(String(30), default="needs_review", index=True)  # 'needs_review', 'reviewed', 'false_positive', 'escalated'
    is_official_excluded = Column(Boolean, default=False)
    raw_signals = Column(JSON, nullable=True)  # name_similarity, logo_similarity, etc.
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    brand = relationship("Brand", back_populates="detections")
    evidence = relationship("DetectionEvidence", back_populates="detection", cascade="all, delete-orphan")

class DetectionEvidence(Base):
    __tablename__ = "detection_evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    detection_id = Column(String(36), ForeignKey("detections.id", ondelete="CASCADE"), nullable=False, index=True)
    signal_type = Column(String(50), nullable=False)
    score = Column(Numeric(5, 2), nullable=True)
    explanation = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)

    detection = relationship("Detection", back_populates="evidence")
