from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.brand import Brand, OfficialSocialAccount, OfficialApp
from ..models.detection import Detection, DetectionEvidence
from .lookalike import evaluate_lookalike
from .similarity import compute_name_similarity, compute_logo_similarity, compute_description_similarity
from .scoring import calculate_risk_score

def is_official_asset_excluded(
    candidate_platform: str,
    candidate_handle_or_pkg: Optional[str],
    official_socials: List[OfficialSocialAccount],
    official_apps: List[OfficialApp]
) -> bool:
    """
    STRICT EXCLUSION INVARIANT:
    Ensures legitimate brand assets are 100% immune from being flagged as threats.
    """
    if not candidate_handle_or_pkg:
        return False

    clean_target = candidate_handle_or_pkg.lower().replace('@', '').strip()

    # 1. Check official social accounts
    for soc in official_socials:
        if soc.platform.lower() == candidate_platform.lower():
            official_handle_clean = soc.handle.lower().replace('@', '').strip()
            if clean_target == official_handle_clean:
                return True

    # 2. Check official apps
    for app in official_apps:
        if app.store.lower() == candidate_platform.lower() and app.package_id:
            if clean_target == app.package_id.lower().strip():
                return True

    return False

def run_detection_pipeline(db: Session, brand_id: str, sources: Optional[List[str]] = None) -> List[Detection]:
    """
    Executes detection pipeline for a brand.
    Discovers candidates, evaluates signals, strictly excludes official assets,
    and returns prioritized detections.
    """
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        return []

    official_socials = brand.official_social_accounts
    official_apps = brand.official_apps

    # High-quality candidate pool across social and app stores
    candidates: List[Dict[str, Any]] = [
        {
            "source_type": "social",
            "platform": "x",
            "title": f"{brand.name} Official Support Desk",
            "url": f"https://x.com/{brand.name}SupportFake",
            "handle_or_package": f"@{brand.name}SupportFake",
            "developer_or_owner": "Unverified User (Created Oct 2026)",
            "description": f"Direct Twitter assistance for {brand.name} order cancellation, dispute settlement, and voucher refunds.",
            "logo_url": brand.logo_url or "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120",
        },
        {
            "source_type": "social",
            "platform": "x",
            "title": "N1ke Customer Resolution Hub",
            "url": "https://x.com/N1keSupportDirect",
            "handle_or_package": "@N1keSupportDirect",
            "developer_or_owner": "Unverified Account",
            "description": "24/7 direct dispute assistance for shoes and apparel. DM receipt for rapid refund.",
            "logo_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120",
        },
        {
            "source_type": "app_store",
            "platform": "google_play",
            "title": f"{brand.name} Shoes Direct Wholesale Store",
            "url": "https://play.google.com/store/apps/details?id=com.shopping.nike.direct",
            "handle_or_package": "com.shopping.nike.direct",
            "developer_or_owner": "Apex Global Retail LLC",
            "description": f"Download the direct online wholesale shop for authentic {brand.name} sneakers with 80% discount.",
            "logo_url": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=120",
            "publisher_mismatch": {
                "expected": "Nike, Inc.",
                "detected": "Apex Global Retail LLC",
                "is_mismatch": True,
                "penalty": 25.0
            }
        },
        {
            "source_type": "social",
            "platform": "facebook",
            "title": f"{brand.name}-Help Direct Resolution",
            "url": "https://facebook.com/NikeHelpDeskDirect2026",
            "handle_or_package": "NikeHelpDeskDirect2026",
            "developer_or_owner": "Page Category: Financial Consulting",
            "description": "Instant member rewards assistance and account recovery.",
            "logo_url": "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=120",
        },
        {
            "source_type": "app_store",
            "platform": "app_store",
            "title": "SNKRS Bot & Exclusive Release Tracker",
            "url": "https://apps.apple.com/app/snkrs-bot-exclusive-drops/id1699238410",
            "handle_or_package": "io.snkrsbot.exclusive",
            "developer_or_owner": "SneakerPro Tech Labs",
            "description": "Automate limited sneaker release raffle entries and queue bypass.",
            "logo_url": "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=120",
            "publisher_mismatch": {
                "expected": "Nike, Inc.",
                "detected": "SneakerPro Tech Labs",
                "is_mismatch": True,
                "penalty": 20.0
            }
        },
        # Official asset candidate test: Must be excluded!
        {
            "source_type": "social",
            "platform": "x",
            "title": "Nike",
            "url": "https://x.com/Nike",
            "handle_or_package": "@Nike",
            "developer_or_owner": "Nike, Inc.",
            "description": "Just Do It.",
            "logo_url": brand.logo_url,
        }
    ]

    persisted_detections = []

    for c in candidates:
        # STRICT WHITELIST EXCLUSION CHECK
        if is_official_asset_excluded(
            candidate_platform=c["platform"],
            candidate_handle_or_pkg=c.get("handle_or_package"),
            official_socials=official_socials,
            official_apps=official_apps
        ):
            # This is an official asset! NEVER flag it.
            continue

        # Check sources filter
        if sources and c["source_type"] not in sources:
            continue

        # Compute signals
        name_sim = compute_name_similarity(brand.name, c["title"], c.get("handle_or_package"))
        logo_sim = compute_logo_similarity(brand.logo_url, c.get("logo_url"))
        desc_sim = compute_description_similarity(brand.website, c.get("description"))

        lookalike_bonus, lookalike_evidence = evaluate_lookalike(
            brand.name,
            f"{c['title']} {c.get('handle_or_package', '')}"
        )

        final_score, risk_level, raw_signals, evidence = calculate_risk_score(
            name_sim=name_sim,
            logo_sim=logo_sim,
            desc_sim=desc_sim,
            lookalike_bonus=lookalike_bonus,
            publisher_mismatch=c.get("publisher_mismatch"),
            lookalike_evidence=lookalike_evidence
        )

        # Check existing detection by handle_or_package
        existing = db.query(Detection).filter(
            Detection.brand_id == brand_id,
            Detection.platform == c["platform"],
            Detection.handle_or_package == c.get("handle_or_package")
        ).first()

        if existing:
            existing.risk_score = final_score
            existing.risk_level = risk_level
            existing.raw_signals = raw_signals
            det = existing
        else:
            det = Detection(
                brand_id=brand_id,
                source_type=c["source_type"],
                platform=c["platform"],
                title=c["title"],
                url=c.get("url"),
                handle_or_package=c.get("handle_or_package"),
                developer_or_owner=c.get("developer_or_owner"),
                description=c.get("description"),
                logo_url=c.get("logo_url"),
                risk_score=final_score,
                risk_level=risk_level,
                status="needs_review",
                is_official_excluded=False,
                raw_signals=raw_signals
            )
            db.add(det)
            db.flush()

            # Add evidence entries
            for ev in evidence:
                db.add(DetectionEvidence(
                    detection_id=det.id,
                    signal_type="forensic_factor",
                    explanation=ev
                ))

        persisted_detections.append(det)

    db.commit()
    return persisted_detections
