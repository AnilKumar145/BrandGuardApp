# BrandGuard – Full-Stack Implementation Plan

End-to-end production backend implementation for **BrandGuard** using FastAPI, SQLAlchemy 2.0, PostgreSQL/Supabase, RapidFuzz, and ImageHash, seamlessly integrated with the React frontend through Vite proxying.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural parameters have been confirmed:
> - **Backend & Frontend Wiring:** FastAPI will run locally, and Vite's dev server will proxy `/api/v1` requests directly to `http://localhost:8000`, ensuring unified single-port access without CORS friction.
> - **Database Strategy:** Configured for PostgreSQL (Supabase-compatible via standard `postgresql+asyncpg://` or `postgresql://` connection strings configured in `DATABASE_URL`), with seamless local fallback to SQLite if `DATABASE_URL` is unconfigured, allowing instantaneous local evaluation.
> - **Exclusion Invariant:** Official brand assets are strictly filtered out of detection results before scoring occurs, guaranteeing zero false positives for verified brand properties.

- **Confirmed Decision 1**: FastAPI backend running with Vite proxying `/api/v1` requests.
- **Confirmed Decision 2**: PostgreSQL (Supabase) integration with `.env` connection string configuration and automated migrations/seeds.

---

## 1. Overview & Core Concept

- **What It Does**: BrandGuard provides digital risk protection by discovering, scoring, and triaging brand impersonation risks across social media channels (X, Instagram, Facebook, TikTok, YouTube) and mobile app stores (Google Play, Apple App Store).
- **Target Audience / Persona**: Brand Protection Analysts (Priya Sharma) and Security Operations Leads (Rajesh Kumar) managing brand assets and legal takedowns.
- **Key Value**: Replaces noisy, manual monitoring with a transparent, multi-signal scoring engine (name similarity, logo perceptual hash, bio match, look-alike homoglyph bonus, publisher mismatch penalty) while immunizing verified brand assets.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Authentication*: Analyst signs in via `/api/v1/auth/login` (or one-click analyst demo); tokens are persisted with seamless refresh.
  2. *Brand Profile*: Analyst manages brand identity (Nike) and registers official social accounts and mobile apps; all registered assets are excluded from alerts.
  3. *On-Demand Scanning*: Trigger `/api/v1/brands/{brand_id}/detections/run` to discover threats, compute rapidfuzz/imagehash scores, and update dashboard metrics.
  4. *Threat Triage*: Analyst investigates prioritized threats in `/detections/:id`, inspects side-by-side ground truth vs. suspect profiles, and marks status (`reviewed`, `false_positive`, `escalated`).
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Dark SaaS aesthetic inspired by Linear, Stripe, and Vercel.
  - *Color System*: Dominant dark canvas (`#090a0f`), structural surfaces (`#0f111a`), primary indigo (`#6366f1`), danger rose (`#f43f5e`), warning amber (`#f59e0b`), success emerald (`#10b981`).
  - *Typography*: Plus Jakarta Sans for crisp UI hierarchy, paired with JetBrains Mono for monospace tabular figures (`tabular-nums`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full FastAPI & Python Architecture in `backend/`**
  - *Chosen Approach*: Implement the complete backend structure recommended by the TDD (`backend/app/api`, `core`, `db`, `models`, `schemas`, `services`), complete with `Dockerfile` and `docker-compose.yml`.
  - *Why*: Aligns 100% with the TDD specification, leveraging Python's rich text/image processing libraries (`rapidfuzz`, `imagehash`, `pillow`).
- **Decision 2: Dual Database Mode (Supabase PostgreSQL + Graceful Fallback)**
  - *Chosen Approach*: Support Supabase PostgreSQL via `DATABASE_URL` in `.env`, while allowing automatic SQLite fallback when testing offline or before provisioning external credentials.
  - *Why*: Guarantees instant zero-friction developer experience during local testing without sacrificing full PostgreSQL compatibility.
- **Decision 3: Multi-Signal Transparent Risk Formula**
  - *Chosen Approach*: Composite weighted score:
    $$\text{Score} = w_1 \times \text{NameSim} + w_2 \times \text{LogoSim} + w_3 \times \text{DescSim} + \text{LookalikeBonus} + \text{PublisherMismatch}$$
  - *Why*: Gives analysts transparent reasoning and forensic explanations rather than opaque black-box verdicts.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React Frontend (Port 3000)                      │
│   Dashboard · Brand Profile · Detections List · Detection Detail       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ /api/v1/* (Vite Proxy)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       FastAPI Backend (Port 8000)                      │
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │   Auth API (JWT)      │   │          Brand Profile API           │  │
│  │  /auth/login, /me     │   │  /brands, /social-accounts, /apps    │  │
│  └───────────────────────┘   └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Detections Engine API                        │  │
│  │     /detections/run, /detections, /detections/{id}, /summary     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                   │                                    │
│  ┌───────────────────────── Core Services ────────────────────────┐   │
│  │ · Look-alike Generator (homoglyphs, spacing, suffixes)         │   │
│  │ · Name Similarity (rapidfuzz Levenshtein & token sort)         │   │
│  │ · Logo Similarity (imagehash perceptual Hamming distance)      │   │
│  │ · Multi-Signal Scoring Engine (weighted breakdown)             │   │
│  │ · Whitelist Exclusion Filter (100% false-positive immunity)    │   │
│  └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQLAlchemy 2.0
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               PostgreSQL Database (Supabase / Docker)                  │
│    users · brands · official_social_accounts · official_apps           │
│    detections · detection_evidence                                     │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Models & Schemas
- `User`: `id`, `email`, `hashed_password`, `full_name`, `is_active`, `created_at`
- `Brand`: `id`, `owner_id`, `name`, `normalized_name`, `website`, `logo_url`, `created_at`
- `OfficialSocialAccount`: `id`, `brand_id`, `platform`, `handle`, `url`, `is_verified`
- `OfficialApp`: `id`, `brand_id`, `name`, `package_id`, `developer_name`, `store`, `store_url`
- `Detection`: `id`, `brand_id`, `source_type`, `platform`, `title`, `url`, `handle_or_package`, `developer_or_owner`, `risk_score`, `risk_level`, `status`, `raw_signals`, `evidence`

### Execution Roadmap
1. **Backend Scaffolding**: Create `backend/app/` structure (`api/v1`, `core`, `db`, `models`, `schemas`, `services`), `requirements.txt`, `alembic`, `Dockerfile`, and `docker-compose.yml`.
2. **Database & Migrations**: Define SQLAlchemy 2.0 models and Alembic setup.
3. **Core Services**:
   - `auth_service.py`: Password hashing & JWT access/refresh token generation.
   - `lookalike.py`: Homoglyph generator, character swap substitutions, and prefix/suffix matching.
   - `similarity.py`: RapidFuzz text similarity & Pillow/imagehash perceptual hashing.
   - `scoring.py`: Weighted risk calculation and evidence synthesizer.
   - `detection_engine.py`: Orchestration pipeline with strict exclusion of official assets.
4. **API Endpoints**: Full implementation of all endpoints from `BrandGuard_API_Spec.md`.
5. **Seed Script**: Populate database with Nike profile, official assets, and 14 realistic high/medium/low detections.
6. **Frontend Integration**:
   - Add Vite proxy configuration for `/api/v1`.
   - Implement frontend API client (`src/services/api.ts`) connecting React queries/mutations to live endpoints with automatic fallback.
7. **Verification**: Run migrations, test API endpoints, and compile frontend.
