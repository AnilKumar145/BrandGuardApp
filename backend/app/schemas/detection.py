from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DetectionRunRequest(BaseModel):
    sources: Optional[List[str]] = Field(default=["social", "app_store"])
    force_refresh: bool = False

class DetectionRunResponse(BaseModel):
    job_id: str
    status: str
    message: str

class PublisherMismatch(BaseModel):
    expected: str
    detected: str
    is_mismatch: bool
    penalty: float

class RawSignals(BaseModel):
    name_similarity: float
    logo_similarity: float
    description_similarity: float
    lookalike_bonus: float
    publisher_mismatch: Optional[PublisherMismatch] = None

class DetectionStatusUpdate(BaseModel):
    status: str = Field(..., description="needs_review | reviewed | false_positive | escalated")

class EvidenceItem(BaseModel):
    signal_type: str
    score: Optional[float] = None
    explanation: str

class DetectionResponse(BaseModel):
    id: str
    brand_id: str
    source_type: str
    platform: str
    title: str
    url: Optional[str] = None
    handle_or_package: Optional[str] = None
    developer_or_owner: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    risk_score: float
    risk_level: str
    status: str
    raw_signals: Optional[Dict[str, Any]] = None
    evidence: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int

class DetectionSummaryCounts(BaseModel):
    high: int
    medium: int
    low: int
    needs_review: int

class PaginatedDetectionsResponse(BaseModel):
    items: List[DetectionResponse]
    pagination: PaginationMeta
    summary: DetectionSummaryCounts

class BrandSummaryResponse(BaseModel):
    brand_id: str
    total_detections: int
    needs_review: int
    high_risk: int
    medium_risk: int
    low_risk: int
    by_source: Dict[str, int]
    by_platform: Dict[str, int]
    last_scan_at: Optional[datetime] = None
