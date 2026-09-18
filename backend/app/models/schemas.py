"""Pydantic request and response schemas."""
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field

# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    phone: str = Field(..., min_length=10, max_length=15)
    email: str = Field(..., min_length=5, max_length=120, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(..., min_length=6, max_length=100)
    confirmPassword: Optional[str] = None

class UserLogin(BaseModel):
    identifier: str = Field(..., min_length=3, max_length=120, description="Email or phone number")
    password: str = Field(..., min_length=1, max_length=100)

class AdminLogin(BaseModel):
    email: str = Field(..., min_length=5, max_length=120, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(..., min_length=1, max_length=100)

class UserProfileUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    phone: str = Field(..., min_length=10, max_length=15)
    email: str = Field(..., min_length=5, max_length=120, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str
    role: str
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    token: str
    user: UserResponse
    message: str = "Authentication successful"

# --- Enquiry Schemas ---
class OrderEnquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=160)
    phone: str = Field(..., min_length=10, max_length=30)
    email: Optional[str] = None
    product: Optional[str] = None
    quantity: Optional[str] = None
    requiredDate: Optional[str] = None
    eggPreference: Optional[str] = None
    customization: Optional[str] = None
    deliveryRequired: Optional[str] = None
    additionalMessage: Optional[str] = None
    referenceImageUrl: Optional[str] = None

class CustomCakeEnquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=160)
    phone: str = Field(..., min_length=10, max_length=30)
    email: Optional[str] = None
    requiredDate: Optional[str] = None
    eggPreference: Optional[str] = None
    occasion: Optional[str] = None
    flavour: Optional[str] = None
    size: Optional[str] = None
    theme: Optional[str] = None
    colour: Optional[str] = None
    sweetness: Optional[str] = None
    messageOnCake: Optional[str] = None
    additionalMessage: Optional[str] = None
    referenceImageUrl: Optional[str] = None

class EnquiryStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Pending|Reviewed|Confirmed|In Preparation|Ready|Completed|Cancelled)$")

class EnquiryResponse(BaseModel):
    success: bool
    id: int
    message: str

class EnquiryDetail(BaseModel):
    id: int
    user_id: Optional[int] = None
    type: str
    name: str
    phone: str
    email: Optional[str] = None
    product: Optional[str] = None
    quantity: Optional[str] = None
    required_date: Optional[str] = None
    egg_preference: Optional[str] = None
    occasion: Optional[str] = None
    flavour: Optional[str] = None
    size: Optional[str] = None
    theme: Optional[str] = None
    colour: Optional[str] = None
    sweetness: Optional[str] = None
    message_on_cake: Optional[str] = None
    customization: Optional[str] = None
    delivery_required: Optional[str] = None
    additional_message: Optional[str] = None
    reference_image_url: Optional[str] = None
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# --- Product Schemas ---
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=60)
    price: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: int = 1

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[int] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    price: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: int
    created_at: Optional[str] = None

# --- Gallery Schemas ---
class GalleryItemCreate(BaseModel):
    src: str
    label: str
    category: str
    ai_context: Optional[str] = None

class GalleryItemResponse(BaseModel):
    id: int
    src: str
    label: str
    category: str
    ai_context: Optional[str] = None
    created_at: Optional[str] = None

# --- Offer Schemas ---
class OfferUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    discount_percent: Optional[int] = None
    is_active: Optional[int] = None
    terms: Optional[str] = None

class OfferResponse(BaseModel):
    id: int
    title: str
    description: str
    discount_percent: int
    is_active: int
    terms: Optional[str] = None
    created_at: Optional[str] = None

# --- Chat & Upload Schemas ---
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)

class ChatResponse(BaseModel):
    answer: str
    grounded: bool
    sources: List[str] = []

class UploadResponse(BaseModel):
    success: bool
    filename: str
    url: str
