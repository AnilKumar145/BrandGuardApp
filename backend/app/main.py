import uuid
from datetime import datetime
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .core.config import settings
from .db.session import engine
from .db.base import Base
from .api.v1.auth import router as auth_router
from .api.v1.brand import router as brand_router
from .api.v1.detections import router as detections_router

# Auto-create tables if running in SQLite / simple mode
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning initializing DB schema: {e}")

app = FastAPI(
    title="BrandGuard API",
    version=settings.VERSION,
    description="Digital Risk Protection Platform - Social & Mobile App Store Impersonation Defense",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID & Logging Middleware
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# Standard Error Format Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail
    error_code = "HTTP_ERROR"
    message = str(detail)
    details = None

    if isinstance(detail, dict):
        error_code = detail.get("error_code", error_code)
        message = detail.get("message", message)
        details = detail.get("details", None)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": exc.status_code,
            "error_code": error_code,
            "message": message,
            "details": details,
            "request_id": request.headers.get("X-Request-ID", str(uuid.uuid4())),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = ".".join(str(l) for l in err.get("loc", []))
        errors.append({
            "field": loc,
            "issue": err.get("msg", "Invalid field value")
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": 422,
            "error_code": "VALIDATION_ERROR",
            "message": "Request validation failed",
            "details": errors,
            "request_id": request.headers.get("X-Request-ID", str(uuid.uuid4())),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    )

# Health & Ready checks
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}

@app.get("/ready", tags=["Health"])
def readiness_check():
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return {"status": "ready", "database": "ok"}
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not_ready", "database": "unreachable", "error": str(e)}
        )

# Register API v1 Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(brand_router, prefix=settings.API_V1_STR)
app.include_router(detections_router, prefix=settings.API_V1_STR)
