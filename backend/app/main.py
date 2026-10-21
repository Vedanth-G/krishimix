from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from app.config import settings
from app.database import engine, Base
from app.data.seed_data import seed_database
from app.routers import crops, evaluate, layout, compare, resources, admin, plans

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("krishimix")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing KrishiMix Database & ML Services...")
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        logger.warning(f"Seed database warning: {e}")
    logger.info("KrishiMix ready to serve smallholder farmers.")
    yield
    logger.info("Shutting down KrishiMix...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Agronomy-aware decision support system for smallholder intercropping, precision planting layouts, and resource estimation.",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev and mobile PWA clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal agronomy service error occurred.", "message": str(exc)}
    )

# Include API Routers under /api/v1
app.include_router(crops.router, prefix=settings.API_V1_STR)
app.include_router(evaluate.router, prefix=settings.API_V1_STR)
app.include_router(layout.router, prefix=settings.API_V1_STR)
app.include_router(compare.router, prefix=settings.API_V1_STR)
app.include_router(resources.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(plans.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "KrishiMix Decision System",
        "version": "1.0.0"
    }
