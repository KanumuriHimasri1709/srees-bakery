"""
File validation utilities for uploaded customer custom cake reference images.
"""
import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException

ALLOWED_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"]
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
UPLOAD_DIR = PROJECT_ROOT / "uploads" / "custom_cake_references"

def validate_and_save_reference_image(file: UploadFile) -> dict:
    """
    Validates uploaded image and saves it to uploads/custom_cake_references/.
    Ensures file is strictly excluded from RAG vector store.
    """
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. Content type check
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{content_type}'. Only JPG, JPEG, PNG, and WEBP are allowed."
        )

    # 2. Extension check
    orig_ext = Path(file.filename or "").suffix.lower()
    if orig_ext not in ALLOWED_EXTENSIONS:
        orig_ext = ALLOWED_MIME_TYPES[content_type][0]

    # 3. Read content and size check
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds maximum limit of 5 MB."
        )

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 4. Generate unique filename to avoid collision or path traversal
    clean_stem = re_slug(Path(file.filename or "cake-ref").stem)[:30]
    unique_id = uuid.uuid4().hex[:8]
    safe_filename = f"{clean_stem}_{unique_id}{orig_ext}"
    dest_path = UPLOAD_DIR / safe_filename

    with open(dest_path, "wb") as f:
        f.write(contents)

    return {
        "filename": safe_filename,
        "url": f"/uploads/custom_cake_references/{safe_filename}",
        "size_bytes": len(contents)
    }

def re_slug(text: str) -> str:
    import re
    cleaned = re.sub(r"[^a-zA-Z0-9_\-]+", "_", text)
    return cleaned.strip("_") or "reference"
