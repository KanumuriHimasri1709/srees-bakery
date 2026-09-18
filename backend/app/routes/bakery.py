"""
Bakery data API routes for public consumption:
Business info, menu, products, gallery, offers, delivery, and FAQs.
"""
from typing import Optional
from fastapi import APIRouter, Query
from backend.app.services.data_service import (
    get_business_info,
    get_menu_data,
    get_delivery_info,
    get_faqs,
    get_offers,
    get_verified_menu_text
)
from backend.app.models.database import (
    get_all_products,
    get_all_gallery_items,
    get_active_offers
)

router = APIRouter(tags=["Bakery"])

# Standard /api/bakery/* routes
@router.get("/api/bakery/info")
def fetch_info():
    return get_business_info()

@router.get("/api/bakery/menu")
def fetch_menu():
    return get_menu_data()

@router.get("/api/bakery/delivery")
def fetch_delivery():
    return get_delivery_info()

@router.get("/api/bakery/faqs")
def fetch_faqs():
    return get_faqs()

@router.get("/api/bakery/offers")
def fetch_offers():
    return get_offers()

@router.get("/api/bakery/menu-verified-text")
def fetch_verified_text():
    return {"content": get_verified_menu_text()}

# New top-level REST groups
@router.get("/api/business")
def get_business():
    return get_business_info()

@router.get("/api/menu")
def get_public_menu(category: Optional[str] = Query(None)):
    products = get_all_products(available_only=True)
    if category and category != "All":
        products = [p for p in products if p.get("category") == category]
    return {
        "success": True,
        "count": len(products),
        "products": products
    }

@router.get("/api/products")
def get_public_products(category: Optional[str] = Query(None)):
    return get_public_menu(category)

@router.get("/api/gallery")
def get_public_gallery(category: Optional[str] = Query(None)):
    items = get_all_gallery_items(category=category)
    return {
        "success": True,
        "count": len(items),
        "gallery": items
    }

@router.get("/api/offers")
def get_public_offers():
    offers = get_active_offers()
    return {
        "success": True,
        "count": len(offers),
        "offers": offers
    }
