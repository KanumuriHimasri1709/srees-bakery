"""
Authentication API endpoints for customer registration, customer login,
admin login, profile inspection and updates.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.models.schemas import (
    UserRegister,
    UserLogin,
    AdminLogin,
    UserProfileUpdate,
    AuthResponse,
    UserResponse
)
from backend.app.models.database import (
    create_user,
    get_user_by_email,
    get_user_by_phone,
    get_user_by_id,
    update_user_profile
)
from backend.app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token
)
from backend.app.utils.auth_deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister):
    """Register a new customer account."""
    if data.confirmPassword and data.password != data.confirmPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # Check if email is already registered
    existing_by_email = get_user_by_email(data.email)
    if existing_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Check if phone is already registered
    existing_by_phone = get_user_by_phone(data.phone)
    if existing_by_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this phone number already exists."
        )

    # Hash password securely
    hashed = hash_password(data.password)

    # Insert new user with customer role
    user_id = create_user(
        name=data.name.strip(),
        phone=data.phone.strip(),
        email=data.email.strip().lower(),
        password_hash=hashed,
        role="customer"
    )

    user = get_user_by_id(user_id)
    token = create_access_token(user_id=user["id"], email=user["email"], role=user["role"])

    return AuthResponse(
        success=True,
        token=token,
        user=UserResponse(**user),
        message="Account created successfully. Welcome to Sree's Home Bakery!"
    )

@router.post("/login", response_model=AuthResponse)
def login(data: UserLogin):
    """Log in customer with email or phone number."""
    identifier = data.identifier.strip()

    # Determine whether identifier is email or phone
    if "@" in identifier:
        user = get_user_by_email(identifier)
    else:
        user = get_user_by_phone(identifier)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/phone or password."
        )

    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/phone or password."
        )

    token = create_access_token(user_id=user["id"], email=user["email"], role=user["role"])
    return AuthResponse(
        success=True,
        token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            phone=user["phone"],
            email=user["email"],
            role=user["role"],
            created_at=user.get("created_at")
        ),
        message="Login successful."
    )

@router.post("/admin-login", response_model=AuthResponse)
def admin_login(data: AdminLogin):
    """Dedicated login endpoint for bakery administrators."""
    user = get_user_by_email(data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrator credentials."
        )

    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrator credentials."
        )

    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted. This account does not possess administrator privileges."
        )

    token = create_access_token(user_id=user["id"], email=user["email"], role=user["role"])
    return AuthResponse(
        success=True,
        token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            phone=user["phone"],
            email=user["email"],
            role=user["role"],
            created_at=user.get("created_at")
        ),
        message="Administrator authentication successful."
    )

@router.get("/me")
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Return the profile of the currently logged-in user."""
    return {
        "success": True,
        "user": current_user
    }

@router.put("/profile")
def update_profile(data: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Update profile information for the authenticated customer."""
    user_id = current_user["id"]
    new_email = data.email.strip().lower()

    # If email changed, check it's not taken by another user
    if new_email != current_user["email"].lower():
        conflict = get_user_by_email(new_email)
        if conflict and conflict["id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email address is already taken by another account."
            )

    update_user_profile(
        user_id=user_id,
        name=data.name.strip(),
        phone=data.phone.strip(),
        email=new_email
    )

    updated_user = get_user_by_id(user_id)
    return {
        "success": True,
        "user": updated_user,
        "message": "Profile updated successfully."
    }
