# BrandGuard – Digital Risk Protection Platform
## Social & Mobile App Store Impersonation Defense

BrandGuard is a complete Digital Risk Protection (DRP) solution designed for brand protection analysts and cybersecurity operations teams. It enables organizations to register their official brand profile, monitor candidate assets across social media platforms and mobile app stores, and surface high-risk impersonation threats through transparent, multi-signal scoring.

---

## Architecture Overview

BrandGuard consists of:
1. **FastAPI Backend (`backend/`)**: Python 3.12, FastAPI, SQLAlchemy 2.0, PostgreSQL (Supabase-compatible), RapidFuzz, ImageHash, and JWT authentication.
2. **React Frontend (`src/`)**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, and Lucide React.
3. **Full-Stack Runtime (`server.ts`)**: Unified Express entry point mounting `/api/v1` and Vite dev middleware for immediate zero-config execution on port 3000.

---

## Quick Start (Docker & Compose)

### 1. Clone & Setup Environment
```bash
git clone <repo-url>
cd brandguard
cp .env.example .env
```

### 2. Run with Docker Compose (Backend + PostgreSQL + Redis)
```bash
docker-compose up -d
```

### 3. Run Alembic Migrations & Seed Data
```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Seed initial Nike ground truth data
docker-compose exec backend python seed.py
```

### 4. Start the Application
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Specification (`/api/v1`)

### Authentication
- `POST /api/v1/auth/login`: Authenticate analyst and return JWT access/refresh tokens.
- `POST /api/v1/auth/refresh`: Exchange refresh token for new access token.
- `GET /api/v1/auth/me`: Get current authenticated user profile.

### Brand Management
- `POST /api/v1/brands`: Create brand profile.
- `GET /api/v1/brands`: List user brands (paginated).
- `GET /api/v1/brands/{brand_id}`: Retrieve brand details & official asset counts.
- `PATCH /api/v1/brands/{brand_id}`: Update brand information.
- `DELETE /api/v1/brands/{brand_id}`: Delete brand.

### Official Asset Whitelist (100% False-Positive Immunity)
- `POST /api/v1/brands/{brand_id}/social-accounts`: Register official social media account.
- `GET /api/v1/brands/{brand_id}/social-accounts`: List official social media accounts.
- `DELETE /api/v1/brands/{brand_id}/social-accounts/{account_id}`: Remove official social account.
- `POST /api/v1/brands/{brand_id}/apps`: Register official mobile app (with package ID & developer name).
- `GET /api/v1/brands/{brand_id}/apps`: List official mobile apps.
- `DELETE /api/v1/brands/{brand_id}/apps/{app_id}`: Remove official app.

### Detection Pipeline & Triage
- `POST /api/v1/brands/{brand_id}/detections/run`: Trigger on-demand detection scan (202 Accepted).
- `GET /api/v1/brands/{brand_id}/detections`: List prioritized detections with multi-facet filters (`risk_level`, `source_type`, `platform`, `status`), sorting, and summary metrics.
- `GET /api/v1/brands/{brand_id}/detections/{detection_id}`: Retrieve detection detail with forensic evidence.
- `PATCH /api/v1/brands/{brand_id}/detections/{detection_id}`: Update triage status (`reviewed`, `false_positive`, `escalated`, `needs_review`).
- `GET /api/v1/brands/{brand_id}/summary`: High-level metrics for executive dashboard.

### Health Endpoints
- `GET /health` → `{"status": "ok"}`
- `GET /ready` → `{"status": "ready", "database": "ok"}`

---

## Multi-Signal Scoring Engine

$$\text{Composite Risk} = 0.40 \times \text{Name} + 0.30 \times \text{Logo} + 0.15 \times \text{Desc} + \text{LookalikeBonus} + \text{PublisherMismatch}$$

- **Name Similarity:** RapidFuzz token sorting & Levenshtein metric.
- **Logo Similarity:** Perceptual pHash visual Hamming distance.
- **Description Similarity:** Semantic keyword and bio overlap.
- **Look-Alike Bonus (Up to +20 pts):** Character swaps (`1` for `i`, `0` for `o`, Turkish dotless `ı`, `vv` for `w`), hyphenated boundaries, and suspicious phishing keywords (`support`, `help`, `refund`).
- **Publisher Mismatch Penalty (+25 pts):** Detected when unauthorized third-party developers publish apps bearing protected brand marks.
- **Official Asset Invariant:** Any asset matching an official registered handle or package ID is strictly excluded from detection results (100% false-positive immunity).

---

## Demo Credentials
- **Analyst:** `priya@company.com` (or `priya@brandguard.io`)
- **Password:** `SecurePass123!`
