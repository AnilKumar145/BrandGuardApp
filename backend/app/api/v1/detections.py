import uuid
import math
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from ...db.session import get_db
from ...models.user import User
from ...models.detection import Detection, DetectionEvidence
from ...schemas.detection import (
    DetectionRunRequest, DetectionRunResponse,
    PaginatedDetectionsResponse, DetectionResponse,
    DetectionStatusUpdate, BrandSummaryResponse
)
from ...services.auth_service import get_current_user
from ...services import brand_service
from ...services.detection_engine import run_detection_pipeline

router = APIRouter(prefix="/brands/{brand_id}", tags=["Detections"])

@router.post("/detections/run", response_model=DetectionRunResponse, status_code=status.HTTP_202_ACCEPTED)
def trigger_detection(
    brand_id: str,
    req: DetectionRunRequest = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brand = brand_service.get_brand_by_id(db, brand_id, current_user.id)
    sources = req.sources if req else ["social", "app_store"]
    
    # Run the detection engine pipeline synchronously or queued
    run_detection_pipeline(db, brand_id, sources)
    
    return DetectionRunResponse(
        job_id=str(uuid.uuid4()),
        status="queued",
        message="Detection job accepted and processed"
    )

@router.get("/detections", response_model=PaginatedDetectionsResponse)
def list_detections(
    brand_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    risk_level: Optional[str] = None,
    source_type: Optional[str] = None,
    platform: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    min_score: Optional[float] = None,
    sort_by: str = Query("risk_score", regex="^(risk_score|created_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brand = brand_service.get_brand_by_id(db, brand_id, current_user.id)

    query = db.query(Detection).filter(
        Detection.brand_id == brand_id,
        Detection.is_official_excluded == False
    )

    if risk_level:
        query = query.filter(Detection.risk_level == risk_level.lower())
    if source_type:
        query = query.filter(Detection.source_type == source_type.lower())
    if platform:
        query = query.filter(Detection.platform == platform.lower())
    if status_filter:
        query = query.filter(Detection.status == status_filter.lower())
    if min_score is not None:
        query = query.filter(Detection.risk_score >= min_score)

    total_items = query.count()

    # Sorting
    order_col = Detection.risk_score if sort_by == "risk_score" else Detection.created_at
    query = query.order_by(desc(order_col) if sort_order == "desc" else asc(order_col))

    # Pagination
    offset = (page - 1) * page_size
    items_db = query.offset(offset).limit(page_size).all()

    # Pre-fetch summary stats for the whole brand
    all_brand_detections = db.query(Detection).filter(
        Detection.brand_id == brand_id,
        Detection.is_official_excluded == False
    ).all()

    summary_counts = {
        "high": sum(1 for d in all_brand_detections if d.risk_level == "high"),
        "medium": sum(1 for d in all_brand_detections if d.risk_level == "medium"),
        "low": sum(1 for d in all_brand_detections if d.risk_level == "low"),
        "needs_review": sum(1 for d in all_brand_detections if d.status == "needs_review"),
    }

    # Format items
    items = []
    for d in items_db:
        evidence_list = [e.explanation for e in d.evidence]
        items.append(DetectionResponse(
            id=d.id,
            brand_id=d.brand_id,
            source_type=d.source_type,
            platform=d.platform,
            title=d.title,
            url=d.url,
            handle_or_package=d.handle_or_package,
            developer_or_owner=d.developer_or_owner,
            description=d.description,
            logo_url=d.logo_url,
            risk_score=float(d.risk_score),
            risk_level=d.risk_level,
            status=d.status,
            raw_signals=d.raw_signals,
            evidence=evidence_list,
            created_at=d.created_at,
            updated_at=d.updated_at
        ))

    return {
        "items": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": math.ceil(total_items / page_size) if total_items > 0 else 1
        },
        "summary": summary_counts
    }

@router.get("/detections/{detection_id}", response_model=DetectionResponse)
def get_detection_detail(
    brand_id: str,
    detection_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brand = brand_service.get_brand_by_id(db, brand_id, current_user.id)
    det = db.query(Detection).filter(
        Detection.id == detection_id,
        Detection.brand_id == brand_id
    ).first()
    if not det:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error_code": "NOT_FOUND", "message": "Detection not found"}
        )

    evidence_list = [e.explanation for e in det.evidence]
    return DetectionResponse(
        id=det.id,
        brand_id=det.brand_id,
        source_type=det.source_type,
        platform=det.platform,
        title=det.title,
        url=det.url,
        handle_or_package=det.handle_or_package,
        developer_or_owner=det.developer_or_owner,
        description=det.description,
        logo_url=det.logo_url,
        risk_score=float(det.risk_score),
        risk_level=det.risk_level,
        status=det.status,
        raw_signals=det.raw_signals,
        evidence=evidence_list,
        created_at=det.created_at,
        updated_at=det.updated_at
    )

@router.patch("/detections/{detection_id}", response_model=DetectionResponse)
def update_detection_status(
    brand_id: str,
    detection_id: str,
    status_in: DetectionStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brand = brand_service.get_brand_by_id(db, brand_id, current_user.id)
    det = db.query(Detection).filter(
        Detection.id == detection_id,
        Detection.brand_id == brand_id
    ).first()
    if not det:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error_code": "NOT_FOUND", "message": "Detection not found"}
        )

    valid_statuses = {"needs_review", "reviewed", "false_positive", "escalated"}
    if status_in.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error_code": "VALIDATION_ERROR", "message": f"Status must be one of: {list(valid_statuses)}"}
        )

    det.status = status_in.status
    det.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(det)

    evidence_list = [e.explanation for e in det.evidence]
    return DetectionResponse(
        id=det.id,
        brand_id=det.brand_id,
        source_type=det.source_type,
        platform=det.platform,
        title=det.title,
        url=det.url,
        handle_or_package=det.handle_or_package,
        developer_or_owner=det.developer_or_owner,
        description=det.description,
        logo_url=det.logo_url,
        risk_score=float(det.risk_score),
        risk_level=det.risk_level,
        status=det.status,
        raw_signals=det.raw_signals,
        evidence=evidence_list,
        created_at=det.created_at,
        updated_at=det.updated_at
    )

@router.get("/summary", response_model=BrandSummaryResponse)
def get_brand_summary(
    brand_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brand = brand_service.get_brand_by_id(db, brand_id, current_user.id)
    all_detections = db.query(Detection).filter(
        Detection.brand_id == brand_id,
        Detection.is_official_excluded == False
    ).all()

    by_source = {"social": 0, "app_store": 0}
    by_platform = {}
    last_scan = None

    for d in all_detections:
        by_source[d.source_type] = by_source.get(d.source_type, 0) + 1
        by_platform[d.platform] = by_platform.get(d.platform, 0) + 1
        if last_scan is None or d.created_at > last_scan:
            last_scan = d.created_at

    return BrandSummaryResponse(
        brand_id=brand.id,
        total_detections=len(all_detections),
        needs_review=sum(1 for d in all_detections if d.status == "needs_review"),
        high_risk=sum(1 for d in all_detections if d.risk_level == "high"),
        medium_risk=sum(1 for d in all_detections if d.risk_level == "medium"),
        low_risk=sum(1 for d in all_detections if d.risk_level == "low"),
        by_source=by_source,
        by_platform=by_platform,
        last_scan_at=last_scan or datetime.utcnow()
    )
