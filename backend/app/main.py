"""
FastAPI application entrypoint for Sree's Home Bakery.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Load environment variables
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

load_dotenv(PROJECT_ROOT / ".env")

from backend.app.models.database import init_db
from backend.app.routes import (
    bakery_router,
    chat_router,
    enquiries_router,
    upload_router,
    auth_router,
    admin_router
)

app = FastAPI(
    title="Sree's Home Bakery API",
    description="Full-stack API supporting Auth, RAG chat, Enquiries, Admin management, and verified bakery menu.",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for customer uploaded reference images
UPLOADS_DIR = PROJECT_ROOT / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Static file serving for gallery assets (if accessed via backend)
GALLERY_DIR = PROJECT_ROOT / "frontend" / "public" / "assets" / "gallery"
if not GALLERY_DIR.exists():
    GALLERY_DIR = PROJECT_ROOT / "backend" / "uploads" / "gallery"
if GALLERY_DIR.exists():
    app.mount("/assets/gallery", StaticFiles(directory=str(GALLERY_DIR)), name="gallery")

# Include API routes
app.include_router(auth_router)
app.include_router(bakery_router)
app.include_router(chat_router)
app.include_router(enquiries_router)
app.include_router(upload_router)
app.include_router(admin_router)

@app.on_event("startup")
def on_startup():
    init_db()
    print("[Backend] Sree's Home Bakery API initialized.")

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "app": "Sree’s Home Bakery API",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)
