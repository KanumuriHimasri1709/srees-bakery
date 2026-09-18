"""
Enquiries API routes for order and custom cake requests,
supporting automatic customer account association and enquiry retrieval.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends
from backend.app.models.schemas import (
    OrderEnquiryCreate,
    CustomCakeEnquiryCreate,
    EnquiryResponse
)
from backend.app.services.enquiry_service import (
    handle_order_enquiry,
    handle_custom_cake_enquiry,
    list_user_enquiries,
    list_enquiries
)
from backend.app.utils.auth_deps import get_optional_user, get_current_user

router = APIRouter(tags=["Enquiries"])

CONFIRMATION_MESSAGE = "Your enquiry has been received. The bakery will contact you for confirmation."

@router.post("/api/enquiries/order", response_model=EnquiryResponse)
def submit_order_enquiry(
    data: OrderEnquiryCreate,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """Submit a standard bakery product order enquiry."""
    user_id = current_user["id"] if current_user else None
    enquiry_data = data.model_dump()
    if current_user and not enquiry_data.get("email"):
        enquiry_data["email"] = current_user.get("email")

    enquiry_id = handle_order_enquiry(enquiry_data, user_id=user_id)
    return EnquiryResponse(
        success=True,
        id=enquiry_id,
        message=CONFIRMATION_MESSAGE
    )

@router.post("/api/enquiries/custom-cake", response_model=EnquiryResponse)
def submit_custom_cake_enquiry(
    data: CustomCakeEnquiryCreate,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """Submit a custom cake design enquiry with reference photo."""
    user_id = current_user["id"] if current_user else None
    enquiry_data = data.model_dump()
    if current_user and not enquiry_data.get("email"):
        enquiry_data["email"] = current_user.get("email")

    enquiry_id = handle_custom_cake_enquiry(enquiry_data, user_id=user_id)
    return EnquiryResponse(
        success=True,
        id=enquiry_id,
        message=CONFIRMATION_MESSAGE
    )

@router.get("/api/user/enquiries")
def get_current_user_enquiries(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve all enquiries submitted by the authenticated customer."""
    enquiries = list_user_enquiries(current_user["id"])
    return {
        "success": True,
        "count": len(enquiries),
        "enquiries": enquiries
    }

@router.get("/api/enquiries/my")
def get_my_enquiries_alias(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Alias for retrieving logged-in customer's enquiries."""
    enquiries = list_user_enquiries(current_user["id"])
    return {
        "success": True,
        "count": len(enquiries),
        "enquiries": enquiries
    }

@router.get("/api/enquiries")
def get_enquiries_public():
    """Retrieve recent enquiries list (backwards compatibility)."""
    return list_enquiries()
