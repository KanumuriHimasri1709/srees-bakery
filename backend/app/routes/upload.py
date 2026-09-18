"""
Custom cake reference image upload route.
Saves customer uploaded images to uploads/custom_cake_references/.
These files strictly do NOT enter the RAG knowledge base.
"""
from fastapi import APIRouter, UploadFile, File
from backend.app.models.schemas import UploadResponse
from backend.app.utils.file_validation import validate_and_save_reference_image

router = APIRouter(prefix="/api/upload-reference", tags=["Uploads"])

@router.post("", response_model=UploadResponse)
def upload_reference(file: UploadFile = File(...)):
    saved = validate_and_save_reference_image(file)
    return UploadResponse(
        success=True,
        filename=saved["filename"],
        url=saved["url"]
    )
