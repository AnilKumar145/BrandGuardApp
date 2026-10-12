import uuid
from datetime import datetime
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.brand import Brand, OfficialSocialAccount, OfficialApp
from app.models.detection import Detection, DetectionEvidence

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.email == "priya@company.com").first()
        if existing_user:
            print("Database already seeded with demo analyst.")
            return

        print("Seeding demo analyst user (Priya Sharma)...")
        user = User(
            id="550e8400-e29b-41d4-a716-446655440000",
            email="priya@company.com",
            hashed_password=get_password_hash("SecurePass123!"),
            full_name="Priya Sharma",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.flush()

        print("Seeding brand profile (Nike)...")
        brand = Brand(
            id="7c9e6679-7425-40de-944b-e07fc1f90ae7",
            owner_id=user.id,
            name="Nike",
            normalized_name="nike",
            website="https://www.nike.com",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(brand)
        db.flush()

        print("Seeding official social accounts...")
        socials = [
            OfficialSocialAccount(
                id=str(uuid.uuid4()),
                brand_id=brand.id,
                platform="x",
                handle="@Nike",
                url="https://x.com/Nike",
                is_verified=True
            ),
            OfficialSocialAccount(
                id=str(uuid.uuid4()),
                brand_id=brand.id,
                platform="instagram",
                handle="@nike",
                url="https://instagram.com/nike",
                is_verified=True
            ),
            OfficialSocialAccount(
                id=str(uuid.uuid4()),
                brand_id=brand.id,
                platform="facebook",
                handle="Nike",
                url="https://facebook.com/nike",
                is_verified=True
            ),
            OfficialSocialAccount(
                id=str(uuid.uuid4()),
                brand_id=brand.id,
                platform="tiktok",
                handle="@nike",
                url="https://tiktok.com/@nike",
                is_verified=True
            ),
            OfficialSocialAccount(
                id=str(uuid.uuid4()),
                brand_id=brand.id,
                platform="youtube",
                handle="Nike",
                url="https://youtube.com/nike",
                is_verified=True
            ),
        ]
        db.add_all(socials)

        print("Seeding official mobile apps...")
        apps = [
            OfficialApp(
                id=str(uuid.uuid4()),
                brand_id=brand.id,
                name="Nike: Shoes, Apparel & Stories",
                package_id="com.nike.omega",
                developer_name="Nike, Inc.",
                store="google_play",
                store_url="https://play.google.com/store/apps/details?id=com.nike.omega",
                logo_url=brand.logo_url
            ),
            OfficialApp(
                id=str(uuid.uuid4()),
                brand_id=brand.id,
                name="Nike SNKRS: Release Dates",
                package_id="com.nike.snkrs",
                developer_name="Nike, Inc.",
                store="app_store",
                store_url="https://apps.apple.com/app/nike-snkrs/id1044458572",
                logo_url=brand.logo_url
            ),
        ]
        db.add_all(apps)

        print("Seeding detections with multi-signal scores & look-alikes...")
        detections_data = [
            {
                "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "source_type": "social",
                "platform": "x",
                "title": "N1ke Support Hub Direct",
                "url": "https://x.com/N1keSupportDirect",
                "handle_or_package": "@N1keSupportDirect",
                "developer_or_owner": "Unverified Account (Created Oct 2026)",
                "description": "Official direct Twitter live assistance for Nike order cancellation, refunds, and promo code support. DM us your receipt.",
                "logo_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120",
                "risk_score": 94.0,
                "risk_level": "high",
                "status": "needs_review",
                "raw_signals": {
                    "name_similarity": 92.0,
                    "logo_similarity": 88.0,
                    "description_similarity": 78.0,
                    "lookalike_bonus": 18.0
                },
                "evidence": [
                    "Character substitution detected: Number '1' substituted for letter 'i' (N1ke vs Nike)",
                    "High-risk brand keywords: 'Support', 'Hub', 'Refunds', 'DM us'",
                    "Perceptual logo hash distance < 6 indicating cropped trademark swoosh reproduction"
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "source_type": "app_store",
                "platform": "google_play",
                "title": "Nike Shoes Direct Online Store",
                "url": "https://play.google.com/store/apps/details?id=com.shopping.nike.direct",
                "handle_or_package": "com.shopping.nike.direct",
                "developer_or_owner": "Apex Global Retail LLC",
                "description": "Download the official direct shop to buy authentic Nike sneakers, Jordans, and apparel at 70% wholesale discount with crypto checkout.",
                "logo_url": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=120",
                "risk_score": 92.0,
                "risk_level": "high",
                "status": "needs_review",
                "raw_signals": {
                    "name_similarity": 95.0,
                    "logo_similarity": 91.0,
                    "description_similarity": 82.0,
                    "lookalike_bonus": 10.0,
                    "publisher_mismatch": {
                        "expected": "Nike, Inc.",
                        "detected": "Apex Global Retail LLC",
                        "is_mismatch": True,
                        "penalty": 25.0
                    }
                },
                "evidence": [
                    "CRITICAL: Developer name mismatch! Expected 'Nike, Inc.', found 'Apex Global Retail LLC'",
                    "App package namespace mimics official brand ('com.shopping.nike.direct')",
                    "High trademark infringement: uses authentic Nike product imagery and swoosh icon"
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "source_type": "social",
                "platform": "facebook",
                "title": "Nike-Help Desk Official Support",
                "url": "https://facebook.com/NikeHelpDeskDirect2026",
                "handle_or_package": "NikeHelpDeskDirect2026",
                "developer_or_owner": "Page Category: Financial Consulting",
                "description": "Instant customer resolution center for Nike Member Rewards, SNKRS app raffle disputes, and compromised account recovery.",
                "logo_url": "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=120",
                "risk_score": 89.0,
                "risk_level": "high",
                "status": "needs_review",
                "raw_signals": {
                    "name_similarity": 88.0,
                    "logo_similarity": 84.0,
                    "description_similarity": 76.0,
                    "lookalike_bonus": 16.0
                },
                "evidence": [
                    "Hyphenated look-alike pattern: 'Nike-Help'",
                    "Official impersonation claim: Page title falsely declares 'Official Support'",
                    "Mismatched page classification: Registered as 'Financial Consulting' instead of Sportswear/Retail"
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "source_type": "app_store",
                "platform": "app_store",
                "title": "SNKRS Bot & Exclusive Drop Tracker",
                "url": "https://apps.apple.com/app/snkrs-bot-exclusive-drops/id1699238410",
                "handle_or_package": "io.snkrsbot.exclusive",
                "developer_or_owner": "SneakerPro Tech Labs",
                "description": "Automate your Nike SNKRS raffle entries, bypass queues, and auto-purchase limited Dunks & Jordan 1s. $29.99/mo subscription.",
                "logo_url": "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=120",
                "risk_score": 88.0,
                "risk_level": "high",
                "status": "escalated",
                "raw_signals": {
                    "name_similarity": 84.0,
                    "logo_similarity": 82.0,
                    "description_similarity": 74.0,
                    "lookalike_bonus": 14.0,
                    "publisher_mismatch": {
                        "expected": "Nike, Inc.",
                        "detected": "SneakerPro Tech Labs",
                        "is_mismatch": True,
                        "penalty": 20.0
                    }
                },
                "evidence": [
                    "Direct trademark infringement on proprietary brand sub-mark 'SNKRS'",
                    "Publisher is third-party ('SneakerPro Tech Labs') with no brand affiliation",
                    "Promotes TOS-violating botting against Nike SNKRS drop servers"
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "source_type": "social",
                "platform": "tiktok",
                "title": "Nıke VIP Members Club Exclusive",
                "url": "https://tiktok.com/@nike_vip_exclusive_drops",
                "handle_or_package": "@nike_vip_exclusive_drops",
                "developer_or_owner": "TikTok Creator Account (No bio verification)",
                "description": "Claim your $250 free Nike gift card. Tap link in bio. Limited to first 500 members! Just Do It!",
                "logo_url": "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=120",
                "risk_score": 86.0,
                "risk_level": "high",
                "status": "needs_review",
                "raw_signals": {
                    "name_similarity": 90.0,
                    "logo_similarity": 85.0,
                    "description_similarity": 72.0,
                    "lookalike_bonus": 20.0
                },
                "evidence": [
                    "Unicode Homoglyph: Uses Turkish dotless 'ı' (U+0131) instead of standard 'i'",
                    "Trademarked slogan misappropriation: Uses 'Just Do It!' to induce consumer trust"
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "source_type": "social",
                "platform": "instagram",
                "title": "Nike Fans Club Daily Inspiration",
                "url": "https://instagram.com/nike_fans_daily",
                "handle_or_package": "@nike_fans_daily",
                "developer_or_owner": "Fan Community Creator",
                "description": "Daily sneaker inspirations, fit pics, and community appreciation for Nike & Jordan enthusiasts. Not affiliated with Nike, Inc.",
                "logo_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=120",
                "risk_score": 64.0,
                "risk_level": "medium",
                "status": "reviewed",
                "raw_signals": {
                    "name_similarity": 74.0,
                    "logo_similarity": 68.0,
                    "description_similarity": 52.0,
                    "lookalike_bonus": 6.0
                },
                "evidence": [
                    "Contains brand name 'Nike' in handle and title",
                    "Contains explicit non-affiliation disclaimer ('Not affiliated with Nike, Inc.')"
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "source_type": "app_store",
                "platform": "app_store",
                "title": "Unofficial Companion Guide for Nike Run Club",
                "url": "https://apps.apple.com/app/unofficial-guide-for-runners/id1522819034",
                "handle_or_package": "com.runcompanion.guide",
                "developer_or_owner": "RunTech Labs",
                "description": "Pacing strategies, training schedule calculators, and community advice for users of Nike Run Club. Unofficial educational guide.",
                "logo_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=120",
                "risk_score": 52.0,
                "risk_level": "medium",
                "status": "false_positive",
                "raw_signals": {
                    "name_similarity": 60.0,
                    "logo_similarity": 45.0,
                    "description_similarity": 54.0,
                    "lookalike_bonus": 4.0
                },
                "evidence": [
                    "Clear 'Unofficial Companion Guide' titling",
                    "App icon does not infringe on Swoosh mark (uses generic stopwatch glyph)",
                    "Complies with nominative fair use guidelines"
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "source_type": "social",
                "platform": "youtube",
                "title": "Swoosh Enthusiasts: Shoe Reviews & History",
                "url": "https://youtube.com/@swooshenthusiasts",
                "handle_or_package": "@swooshenthusiasts",
                "developer_or_owner": "Marcus Bell (Shoe Collector)",
                "description": "Unboxing, teardown reviews, and sneaker history focusing on vintage running prototypes from 1970 to present day.",
                "logo_url": "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=120",
                "risk_score": 34.0,
                "risk_level": "low",
                "status": "reviewed",
                "raw_signals": {
                    "name_similarity": 38.0,
                    "logo_similarity": 25.0,
                    "description_similarity": 32.0,
                    "lookalike_bonus": 0.0
                },
                "evidence": [
                    "Pure editorial video critique and historical analysis",
                    "No impersonation or scam indicators present"
                ]
            }
        ]

        for d_data in detections_data:
            evidences = d_data.pop("evidence")
            det = Detection(
                brand_id=brand.id,
                **d_data
            )
            db.add(det)
            db.flush()
            for ev in evidences:
                db.add(DetectionEvidence(
                    detection_id=det.id,
                    signal_type="forensic_factor",
                    explanation=ev
                ))

        db.commit()
        print("Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
