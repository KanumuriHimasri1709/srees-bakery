"""
FastAPI authentication dependencies for protecting routes.
"""
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from backend.app.services.auth_service import decode_access_token
from backend.app.models.database import get_user_by_id

async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Extract and return user if valid Authorization header is present, else None."""
    if not authorization:
        return None

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None

    payload = decode_access_token(token)
    if not payload or "user_id" not in payload:
        return None

    user = get_user_by_id(payload["user_id"])
    return user

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Strictly require authenticated user. Raises 401 Unauthorized if missing/invalid."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme. Use 'Bearer <token>'."
        )

    payload = decode_access_token(token)
    if not payload or "user_id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid. Please log in again."
        )

    user = get_user_by_id(payload["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists."
        )

    return user

async def require_admin(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Strictly require admin user. Raises 401 if unauthenticated, 403 if not admin."""
    user = await get_current_user(authorization)
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required."
        )
    return user
