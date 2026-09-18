"""
Service for processing and retrieving order and custom cake enquiries.
"""
from typing import Dict, Any, List, Optional
from backend.app.models.database import (
    save_order_enquiry,
    save_custom_cake_enquiry,
    get_user_enquiries,
    get_all_enquiries
)

def handle_order_enquiry(data: Dict[str, Any], user_id: Optional[int] = None) -> int:
    return save_order_enquiry(data, user_id=user_id)

def handle_custom_cake_enquiry(data: Dict[str, Any], user_id: Optional[int] = None) -> int:
    return save_custom_cake_enquiry(data, user_id=user_id)

def list_user_enquiries(user_id: int) -> List[Dict[str, Any]]:
    return get_user_enquiries(user_id)

def list_enquiries(limit: int = 50) -> List[Dict[str, Any]]:
    return get_all_enquiries()[:limit]
