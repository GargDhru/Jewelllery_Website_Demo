from contextlib import asynccontextmanager
import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db
from app.api import (
    auth, categories, products, cart, orders, coupons, reviews, banners, admin
)

# Path where the built React frontend lives (relative to backend/ root)
STATIC_DIR = Path(__file__).parent.parent / "static"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed initial data
    try:
        await init_db()
        print("✓ Database tables verified and initial luxury seed data populated.")
    except Exception as e:
        print(f"Database init warning: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance backend API for Aura Atelier Luxury Jewellery E-Commerce.",
    lifespan=lifespan
)

# CORS setup (kept for local dev; in production same-origin requests don't need it)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_origin_regex=r"^https:\/\/.*\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers (must come BEFORE the static-file catch-all) ──────────────────
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(cart.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(coupons.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(banners.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
async def health_check():
    from app.core.firebase import is_firebase_available
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "firebase_firestore" if is_firebase_available() else "sqlite_fallback"
    }

# ── Serve built React frontend ─────────────────────────────────────────────────
# Mount /assets and other static asset folders from the dist build
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/favicon.svg")
    async def favicon():
        return FileResponse(str(STATIC_DIR / "favicon.svg"))

    # SPA catch-all: any non-API route serves index.html so React Router works
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str, request: Request):
        index = STATIC_DIR / "index.html"
        if index.exists():
            return FileResponse(str(index))
        return JSONResponse({"detail": "Frontend not built"}, status_code=404)
else:
    # Static dir not present (local backend-only dev)
    @app.get("/")
    async def root():
        return {
            "brand": "AURA ATELIER",
            "tagline": "Handcrafted Luxury Jewellery & Modern Elegance",
            "docs": "/docs",
            "health": "/api/health"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


