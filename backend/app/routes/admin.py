"""
Admin business management endpoints for Sree's Home Bakery:
Overview stats, enquiry management, menu CRUD, gallery CRUD, offers, customers, and RAG knowledge rebuilding.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from backend.app.utils.auth_deps import require_admin
from backend.app.models.schemas import (
    EnquiryStatusUpdate,
    ProductCreate,
    ProductUpdate,
    GalleryItemCreate,
    OfferUpdate
)
from backend.app.models.database import (
    get_enquiry_stats,
    get_all_enquiries,
    get_enquiry_by_id,
    update_enquiry_status,
    get_all_products,
    get_product_by_id,
    create_product,
    update_product,
    delete_product,
    get_all_gallery_items,
    add_gallery_item,
    delete_gallery_item,
    get_all_offers,
    update_offer,
    get_all_customers,
    get_user_enquiries,
    get_connection
)

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])

@router.get("/overview")
def get_overview_stats():
    """Retrieve real administrative dashboard metrics."""
    stats = get_enquiry_stats()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE role = 'customer'")
        total_customers = cursor.fetchone()["total"]
        cursor.execute("SELECT COUNT(*) as total FROM products")
        total_products = cursor.fetchone()["total"]

    return {
        "success": True,
        "enquiries": stats,
        "total_customers": total_customers,
        "total_products": total_products
    }

# --- Enquiry Management ---

@router.get("/enquiries")
def list_enquiries(
    status_filter: Optional[str] = Query(None, alias="status"),
    type_filter: Optional[str] = Query(None, alias="type"),
    search: Optional[str] = Query(None)
):
    """List customer enquiries with optional status, type, and keyword search filters."""
    enquiries = get_all_enquiries(status=status_filter, enquiry_type=type_filter)
    if search:
        s = search.lower().strip()
        enquiries = [
            e for e in enquiries
            if s in (e.get("name") or "").lower()
            or s in (e.get("phone") or "").lower()
            or s in (e.get("product") or "").lower()
            or s in (e.get("flavour") or "").lower()
            or s in str(e.get("id"))
        ]
    return {
        "success": True,
        "count": len(enquiries),
        "enquiries": enquiries
    }

@router.get("/enquiries/{enquiry_id}")
def get_enquiry_details(enquiry_id: int):
    """Retrieve full details of a specific enquiry."""
    enquiry = get_enquiry_by_id(enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found.")
    return {
        "success": True,
        "enquiry": enquiry
    }

@router.patch("/enquiries/{enquiry_id}/status")
def change_enquiry_status(enquiry_id: int, payload: EnquiryStatusUpdate):
    """Update enquiry status (Pending, Reviewed, Confirmed, In Preparation, Ready, Completed, Cancelled)."""
    enquiry = get_enquiry_by_id(enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found.")

    success = update_enquiry_status(enquiry_id, payload.status)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update enquiry status.")

    updated = get_enquiry_by_id(enquiry_id)
    return {
        "success": True,
        "message": f"Enquiry #{enquiry_id} status updated to {payload.status}.",
        "enquiry": updated
    }

# --- Menu Management ---

@router.get("/menu")
def get_admin_menu():
    """Retrieve all products including disabled products."""
    products = get_all_products(available_only=False)
    return {
        "success": True,
        "count": len(products),
        "products": products
    }

@router.post("/menu", status_code=status.HTTP_201_CREATED)
def create_menu_product(payload: ProductCreate):
    """Add a new product to the bakery catalog."""
    product_id = create_product(payload.model_dump())
    product = get_product_by_id(product_id)
    return {
        "success": True,
        "message": "Product created successfully.",
        "product": product
    }

@router.put("/menu/{product_id}")
def edit_menu_product(product_id: int, payload: ProductUpdate):
    """Update details, category, price, or availability of a menu product."""
    existing = get_product_by_id(product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found.")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    success = update_product(product_id, update_data)
    if not success:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    updated = get_product_by_id(product_id)
    return {
        "success": True,
        "message": "Product updated successfully.",
        "product": updated
    }

@router.delete("/menu/{product_id}")
def remove_menu_product(product_id: int):
    """Delete a menu product."""
    existing = get_product_by_id(product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found.")

    delete_product(product_id)
    return {
        "success": True,
        "message": f"Product #{product_id} deleted successfully."
    }

# --- Gallery Management ---

@router.get("/gallery")
def get_admin_gallery():
    """Retrieve all gallery photo items."""
    items = get_all_gallery_items()
    return {
        "success": True,
        "count": len(items),
        "gallery": items
    }

@router.post("/gallery", status_code=status.HTTP_201_CREATED)
def add_gallery_photo(payload: GalleryItemCreate):
    """Add a photo item to the gallery."""
    item_id = add_gallery_item(payload.model_dump())
    return {
        "success": True,
        "message": "Gallery image added successfully.",
        "id": item_id
    }

@router.delete("/gallery/{item_id}")
def remove_gallery_photo(item_id: int):
    """Remove a photo item from the gallery."""
    delete_gallery_item(item_id)
    return {
        "success": True,
        "message": f"Gallery item #{item_id} removed."
    }

# --- Offers Management ---

@router.get("/offers")
def get_admin_offers():
    """Retrieve all offers."""
    offers = get_all_offers()
    return {
        "success": True,
        "offers": offers
    }

@router.put("/offers/{offer_id}")
def edit_offer(offer_id: int, payload: OfferUpdate):
    """Update offer terms, description, or discount percentage."""
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    success = update_offer(offer_id, update_data)
    if not success:
        raise HTTPException(status_code=400, detail="No fields provided to update.")
    return {
        "success": True,
        "message": "Offer updated successfully."
    }

# --- Customers Management ---

@router.get("/customers")
def list_customers():
    """List all registered customers with registration date and enquiry counts."""
    customers = get_all_customers()
    return {
        "success": True,
        "count": len(customers),
        "customers": customers
    }

@router.get("/customers/{customer_id}/enquiries")
def get_customer_enquiry_history(customer_id: int):
    """Retrieve enquiry history for a specific customer."""
    enquiries = get_user_enquiries(customer_id)
    return {
        "success": True,
        "customer_id": customer_id,
        "enquiries": enquiries
    }

# --- RAG Knowledge Base Management ---

@router.get("/rag/status")
def get_rag_status():
    """Return RAG knowledge base statistics and vector store health."""
    import json
    from pathlib import Path
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    index_file = project_root / "vector_store" / "index.json"
    docs_dir = project_root / "rag" / "documents"

    num_docs = len(list(docs_dir.glob("*.txt"))) if docs_dir.exists() else 0
    chunk_count = 0
    vocab_size = 0
    index_exists = index_file.exists()
    last_modified = None

    if index_exists:
        try:
            import datetime
            mtime = index_file.stat().st_mtime
            last_modified = datetime.datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
            with open(index_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                chunk_count = len(data.get("chunks", []))
                vocab_size = len(data.get("vocabulary", {}))
        except Exception:
            pass

    return {
        "success": True,
        "status": "Healthy" if index_exists else "Not Initialized",
        "documents_count": num_docs,
        "chunk_count": chunk_count,
        "vocabulary_size": vocab_size,
        "last_updated": last_modified,
        "vector_store_path": "vector_store/index.json"
    }

@router.post("/rag/rebuild")
def rebuild_rag_knowledge():
    """Controlled rebuild of the RAG knowledge base from verified documents."""
    try:
        from rag.create_embeddings import build_vector_store
        from rag.retriever import get_retriever

        # Build fresh vector store
        store_data = build_vector_store()

        # Reload singleton retriever
        retriever = get_retriever()
        retriever._load_store()

        return {
            "success": True,
            "message": f"Knowledge base rebuilt successfully with {len(store_data.get('chunks', []))} chunks.",
            "chunk_count": len(store_data.get("chunks", []))
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to rebuild knowledge base: {str(e)}"
        )
