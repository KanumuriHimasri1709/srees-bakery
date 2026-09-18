"""Routes package."""
from .bakery import router as bakery_router
from .chat import router as chat_router
from .enquiries import router as enquiries_router
from .upload import router as upload_router
from .auth import router as auth_router
from .admin import router as admin_router

__all__ = [
    "bakery_router",
    "chat_router",
    "enquiries_router",
    "upload_router",
    "auth_router",
    "admin_router"
]
