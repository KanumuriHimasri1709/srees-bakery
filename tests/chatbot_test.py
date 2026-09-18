"""
End-to-end API integration tests for Sree's Home Bakery FastAPI backend:
Health, RAG chat, Customer Auth, Admin Auth, Enquiries, Role Protection, and Reference Upload.
"""
import io
import sys
from pathlib import Path
from starlette.testclient import TestClient

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app
from rag.prompts import FALLBACK_MESSAGE

client = TestClient(app)

def test_health_and_info_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    info_res = client.get("/api/bakery/info")
    assert info_res.status_code == 200
    info_data = info_res.json()
    assert "Sree’s Home Bakery" in info_data.get("name", "")
    assert "7981468535" in info_data.get("phones", [])

def test_chat_timings():
    res = client.post("/api/chat", json={"message": "What are your bakery timings?"})
    assert res.status_code == 200
    data = res.json()
    assert "9:00 AM – 9:00 PM" in data["answer"]
    assert data["grounded"] is True

def test_chat_delivery_charges():
    res = client.post("/api/chat", json={"message": "Who pays delivery charges?"})
    assert res.status_code == 200
    data = res.json()
    assert "Rapido" in data["answer"]
    assert "paid by the customer" in data["answer"].lower()
    assert data["grounded"] is True

def test_chat_unknown_question_fallback():
    res = client.post("/api/chat", json={"message": "Do you sell sushi or hot dogs?"})
    assert res.status_code == 200
    data = res.json()
    assert data["answer"] == FALLBACK_MESSAGE
    assert data["grounded"] is False
    assert "7981468535" in data["answer"]

def test_customer_auth_flow():
    # 1. Register a customer
    reg_payload = {
        "name": "Priya Sharma",
        "phone": "9848022338",
        "email": "priya.sharma@example.com",
        "password": "Password@123",
        "confirmPassword": "Password@123"
    }
    # Might already exist if re-running tests, so handle both 201 or login
    reg_res = client.post("/api/auth/register", json=reg_payload)
    if reg_res.status_code == 201:
        reg_data = reg_res.json()
        assert reg_data["success"] is True
        token = reg_data["token"]
    else:
        # Log in if already registered
        login_res = client.post("/api/auth/login", json={
            "identifier": "priya.sharma@example.com",
            "password": "Password@123"
        })
        assert login_res.status_code == 200
        token = login_res.json()["token"]

    # 2. Get profile with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_info = me_res.json()["user"]
    assert user_info["role"] == "customer"

    # 3. Customer must NOT be allowed to access admin routes
    admin_attempt = client.get("/api/admin/enquiries", headers=headers)
    assert admin_attempt.status_code == 403, "Customer must be rejected from admin endpoints"

def test_admin_auth_and_enquiry_status_flow():
    # 1. Log in as admin
    admin_login_res = client.post("/api/auth/admin-login", json={
        "email": "admin@sreesbakery.com",
        "password": "Admin@123"
    })
    assert admin_login_res.status_code == 200
    admin_data = admin_login_res.json()
    assert admin_data["user"]["role"] == "admin"
    admin_token = admin_data["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Submit an enquiry as customer
    enquiry_res = client.post("/api/enquiries/order", json={
        "name": "Ravi Kumar",
        "phone": "9988776655",
        "email": "ravi@example.com",
        "product": "Chocolate Cake",
        "quantity": "1 kg",
        "requiredDate": "2026-11-20",
        "eggPreference": "Eggless",
        "deliveryRequired": "Yes"
    })
    assert enquiry_res.status_code == 200
    enquiry_id = enquiry_res.json()["id"]

    # 3. Admin lists enquiries and verifies the new enquiry exists
    list_res = client.get("/api/admin/enquiries", headers=admin_headers)
    assert list_res.status_code == 200
    enquiries = list_res.json()["enquiries"]
    matching = [e for e in enquiries if e["id"] == enquiry_id]
    assert len(matching) > 0

    # 4. Admin updates enquiry status to Confirmed
    update_res = client.patch(
        f"/api/admin/enquiries/{enquiry_id}/status",
        headers=admin_headers,
        json={"status": "Confirmed"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["enquiry"]["status"] == "Confirmed"

def test_reference_image_upload_and_isolation():
    dummy_image_data = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    file_tuple = ("test_cake_ref.png", io.BytesIO(dummy_image_data), "image/png")

    res = client.post("/api/upload-reference", files={"file": file_tuple})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "uploads/custom_cake_references" in data["url"]

    filename = data["filename"]
    uploaded_file_path = PROJECT_ROOT / "uploads" / "custom_cake_references" / filename
    assert uploaded_file_path.exists()

    # STRICT REQUIREMENT: Customer reference upload must NEVER enter RAG documents
    rag_docs = list((PROJECT_ROOT / "rag" / "documents").glob("*"))
    assert not any(filename in str(d) for d in rag_docs), "Customer uploads MUST NEVER enter RAG documents!"

if __name__ == "__main__":
    test_health_and_info_endpoint()
    print("[PASS] test_health_and_info_endpoint")
    test_chat_timings()
    print("[PASS] test_chat_timings")
    test_chat_delivery_charges()
    print("[PASS] test_chat_delivery_charges")
    test_chat_unknown_question_fallback()
    print("[PASS] test_chat_unknown_question_fallback")
    test_customer_auth_flow()
    print("[PASS] test_customer_auth_flow")
    test_admin_auth_and_enquiry_status_flow()
    print("[PASS] test_admin_auth_and_enquiry_status_flow")
    test_reference_image_upload_and_isolation()
    print("[PASS] test_reference_image_upload_and_isolation")
    print("\nAll Chatbot, Auth, Admin & Backend API tests PASSED successfully!")
