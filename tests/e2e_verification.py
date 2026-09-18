"""
End-to-End System Verification Script for Sree's Home Bakery.
Validates:
1. Public endpoints & Vite dev server proxy
2. Customer registration & session token authentication
3. Customer custom cake enquiry with isolated photo upload
4. Customer portal enquiries retrieval
5. Admin authentication & role authorization
6. Admin enquiry status management lifecycle
7. Admin RAG status check & knowledge rebuild
8. Grounded RAG Chatbot precision & anti-hallucination fallback
9. Strict role enforcement (non-admin 403)
"""

import sys
import os
import json
import urllib.request
import urllib.parse
import urllib.error
import time

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BACKEND_URL = "http://127.0.0.1:8001"
FRONTEND_URL = "http://127.0.0.1:5173"

def http_req(url, method="GET", data=None, headers=None):
    req_headers = headers.copy() if headers else {}
    body = None
    if data is not None:
        if isinstance(data, (dict, list)):
            body = json.dumps(data).encode("utf-8")
            req_headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            body = data
        elif isinstance(data, str):
            body = data.encode("utf-8")
    
    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content_type = resp.headers.get("Content-Type", "")
            resp_body = resp.read()
            if "application/json" in content_type:
                return status, json.loads(resp_body.decode("utf-8")), resp.headers
            return status, resp_body.decode("utf-8", errors="replace"), resp.headers
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        try:
            err_json = json.loads(err_body)
            return e.code, err_json, e.headers
        except Exception:
            return e.code, err_body, e.headers
    except Exception as e:
        return 0, str(e), {}

def run_tests():
    print("=" * 70)
    print("SREE'S HOME BAKERY - COMPREHENSIVE E2E VERIFICATION")
    print("=" * 70)
    
    passed = 0
    failed = 0

    def assert_test(cond, title, details=""):
        nonlocal passed, failed
        if cond:
            passed += 1
            print(f"[PASS] {title}")
        else:
            failed += 1
            print(f"[FAIL] {title} -> {details}")

    # 1. Health check direct backend
    status, body, _ = http_req(f"{BACKEND_URL}/api/health")
    assert_test(status == 200 and body.get("status") == "ok", "Backend direct health check (/api/health)", f"Status: {status}, Body: {body}")

    # 2. Vite Proxy check
    status, body, _ = http_req(f"{FRONTEND_URL}/api/business")
    assert_test(status == 200 and "Sree" in body.get("name", ""), "Vite dev server proxy forward to backend (/api/business)", f"Status: {status}, Body: {body}")

    # 3. Verified Products check
    status, body, _ = http_req(f"{BACKEND_URL}/api/products")
    products = body.get("products", []) if isinstance(body, dict) else []
    assert_test(status == 200 and len(products) >= 30, f"Products catalog contains {len(products)} items (>= 30 expected)")

    # 4. Gallery endpoint
    status, body, _ = http_req(f"{BACKEND_URL}/api/gallery")
    gallery = body.get("gallery", []) if isinstance(body, dict) else []
    assert_test(status == 200 and len(gallery) >= 40, f"Gallery contains {len(gallery)} genuine bakery images (>= 40 expected)")

    # 5. Customer Registration
    ts = int(time.time() * 1000) % 1000000000
    test_email = f"customer_{ts}@example.com"
    test_phone = f"9{ts:09d}"[:10]
    reg_payload = {
        "name": "Ananya Sharma",
        "email": test_email,
        "phone": test_phone,
        "password": "Password123"
    }
    status, body, _ = http_req(f"{BACKEND_URL}/api/auth/register", method="POST", data=reg_payload)
    customer_token = body.get("token") if isinstance(body, dict) else None
    assert_test(status == 201 and customer_token is not None, f"Customer registration ({test_email})", f"Status: {status}, Body: {body}")

    # 6. Customer Session /me check
    cust_headers = {"Authorization": f"Bearer {customer_token}"}
    status, body, _ = http_req(f"{BACKEND_URL}/api/auth/me", headers=cust_headers)
    user_data = body.get("user", {}) if isinstance(body, dict) else {}
    assert_test(status == 200 and user_data.get("email") == test_email and user_data.get("role") == "customer",
                "Customer /api/auth/me returns valid role 'customer'", f"Status: {status}, Body: {body}")

    # 7. Customer Image Upload for Custom Cake
    boundary = "----WebKitFormBoundaryE2ETest7MA4YWxkTrZu0gW"
    sample_image_data = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
    form_lines = [
        f"--{boundary}".encode("utf-8"),
        b'Content-Disposition: form-data; name="file"; filename="sample_theme_cake.jpg"',
        b"Content-Type: image/jpeg",
        b"",
        sample_image_data,
        f"--{boundary}--".encode("utf-8"),
        b""
    ]
    form_body = b"\r\n".join(form_lines)
    upload_headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Authorization": f"Bearer {customer_token}"
    }
    status, body, _ = http_req(f"{BACKEND_URL}/api/upload-reference", method="POST", data=form_body, headers=upload_headers)
    uploaded_url = body.get("url") if isinstance(body, dict) else None
    assert_test(status == 200 and uploaded_url and "custom_cake_references" in uploaded_url,
                f"Custom cake reference photo upload: {uploaded_url}", f"Status: {status}, Body: {body}")

    # 8. Submit Custom Cake Enquiry
    custom_cake_payload = {
        "name": "Ananya Sharma",
        "phone": test_phone,
        "email": test_email,
        "requiredDate": "2026-09-25",
        "flavour": "Chocolate Truffle with Fondant Accents",
        "size": "2 kg",
        "eggPreference": "Eggless",
        "theme": "2-tier floral pastel theme for birthday",
        "referenceImageUrl": uploaded_url,
        "additionalMessage": "Please keep sugar moderate. Rapido delivery to Pratap Nagar."
    }
    status, body, _ = http_req(f"{BACKEND_URL}/api/enquiries/custom-cake", method="POST", data=custom_cake_payload, headers=cust_headers)
    enquiry_id = body.get("id") if isinstance(body, dict) else None
    assert_test(status in (200, 201) and enquiry_id is not None, f"Customer submitted custom cake enquiry (ID: {enquiry_id})", f"Status: {status}, Body: {body}")

    # 9. Customer views their own enquiries
    status, body, _ = http_req(f"{BACKEND_URL}/api/user/enquiries", headers=cust_headers)
    customer_enquiries = body.get("enquiries", []) if isinstance(body, dict) else []
    my_enquiry = [e for e in customer_enquiries if e.get("id") == enquiry_id]
    my_enquiry_item = my_enquiry[0] if my_enquiry else {}
    assert_test(status == 200 and my_enquiry_item.get("status") == "Pending",
                f"Customer retrieved their enquiry with status '{my_enquiry_item.get('status')}'", f"Status: {status}, Body: {body}")

    # 10. Admin Login
    admin_login_payload = {
        "email": "admin@sreesbakery.com",
        "password": "Admin@123"
    }
    status, body, _ = http_req(f"{BACKEND_URL}/api/auth/admin-login", method="POST", data=admin_login_payload)
    admin_token = body.get("token") if isinstance(body, dict) else None
    assert_test(status == 200 and admin_token is not None, "Admin authentication with default credentials (admin@sreesbakery.com)", f"Status: {status}, Body: {body}")

    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 11. Admin Overview
    status, body, _ = http_req(f"{BACKEND_URL}/api/admin/overview", headers=admin_headers)
    assert_test(status == 200 and "enquiries" in body and "total_products" in body,
                f"Admin overview metrics: {body.get('enquiries', {}).get('total')} enquiries, {body.get('total_products')} products", f"Status: {status}, Body: {body}")

    # 12. Admin Enquiries List
    status, body, _ = http_req(f"{BACKEND_URL}/api/admin/enquiries", headers=admin_headers)
    admin_enquiries = body.get("enquiries", []) if isinstance(body, dict) else []
    assert_test(status == 200 and any(e.get("id") == enquiry_id for e in admin_enquiries),
                f"Admin sees new customer enquiry ID {enquiry_id} in enquiries list", f"Status: {status}")

    # 13. Admin Status Update -> Confirmed
    status_update_payload = {
        "status": "Confirmed"
    }
    status, body, _ = http_req(f"{BACKEND_URL}/api/admin/enquiries/{enquiry_id}/status", method="PATCH", data=status_update_payload, headers=admin_headers)
    updated_obj = body.get("enquiry", {}) if isinstance(body, dict) else {}
    assert_test(status == 200 and updated_obj.get("status") == "Confirmed", f"Admin updated enquiry ID {enquiry_id} status to 'Confirmed'", f"Status: {status}, Body: {body}")

    # 14. Customer verifies status updated
    status, body, _ = http_req(f"{BACKEND_URL}/api/user/enquiries", headers=cust_headers)
    customer_enquiries = body.get("enquiries", []) if isinstance(body, dict) else []
    refetched = [e for e in customer_enquiries if e.get("id") == enquiry_id]
    refetched_item = refetched[0] if refetched else {}
    assert_test(status == 200 and refetched_item.get("status") == "Confirmed",
                f"Customer portal reflects updated status 'Confirmed' (Lifecycle management working)", f"Status: {status}, Body: {body}")

    # 15. Admin RAG Status
    status, body, _ = http_req(f"{BACKEND_URL}/api/admin/rag/status", headers=admin_headers)
    assert_test(status == 200 and body.get("chunk_count", 0) > 0,
                f"Admin RAG status check: {body.get('chunk_count')} chunks, {body.get('vocabulary_size')} vocabulary tokens", f"Status: {status}, Body: {body}")

    # 16. Admin RAG Rebuild
    status, body, _ = http_req(f"{BACKEND_URL}/api/admin/rag/rebuild", method="POST", headers=admin_headers)
    assert_test(status == 200 and body.get("chunk_count", 0) > 0,
                f"Admin RAG rebuild completed successfully ({body.get('chunk_count')} chunks indexed)", f"Status: {status}, Body: {body}")

    # 17. Security Check: Customer accessing admin endpoint -> 403 Forbidden
    status, body, _ = http_req(f"{BACKEND_URL}/api/admin/overview", headers=cust_headers)
    assert_test(status == 403, "Strict Role Security: Customer forbidden from /api/admin/overview (HTTP 403)", f"Status: {status}")

    # 18. RAG Chatbot: Verified Knowledge (Address & Phone)
    chat_payload = {"message": "What is the address and phone number of the bakery?"}
    status, body, _ = http_req(f"{BACKEND_URL}/api/chat", method="POST", data=chat_payload)
    reply = body.get("answer", "") if isinstance(body, dict) else ""
    assert_test(status == 200 and "Mega Residency" in reply and "7981468535" in reply,
                "RAG Chatbot correctly provides verified address & phone number", f"Reply: {reply}")

    # 19a. RAG Chatbot: Verified Knowledge (Rapido Delivery)
    chat_payload = {"message": "How is delivery handled?"}
    status, body, _ = http_req(f"{BACKEND_URL}/api/chat", method="POST", data=chat_payload)
    reply = body.get("answer", "") if isinstance(body, dict) else ""
    assert_test(status == 200 and "Rapido" in reply,
                "RAG Chatbot correctly specifies Rapido delivery", f"Reply: {reply}")

    # 19b. RAG Chatbot: Verified Knowledge (PhonePe Payment)
    chat_payload = {"message": "What payment method do you accept?"}
    status, body, _ = http_req(f"{BACKEND_URL}/api/chat", method="POST", data=chat_payload)
    reply = body.get("answer", "") if isinstance(body, dict) else ""
    assert_test(status == 200 and "PhonePe" in reply,
                "RAG Chatbot correctly specifies PhonePe payment", f"Reply: {reply}")

    # 20. RAG Chatbot: Scoped Dietary Claim (Millet Cookies only)
    chat_payload = {"message": "Which products are sugar-free and maida-free?"}
    status, body, _ = http_req(f"{BACKEND_URL}/api/chat", method="POST", data=chat_payload)
    reply = body.get("answer", "") if isinstance(body, dict) else ""
    assert_test(status == 200 and "Millet Cookies" in reply,
                "RAG Chatbot scopes sugar-free/maida-free claim strictly to Millet Cookies", f"Reply: {reply}")

    # 21. RAG Chatbot: Anti-Hallucination Fallback for Out-of-Domain Query
    chat_payload = {"message": "Do you offer gluten-free vegan pizza with same-day helicopter delivery to Hyderabad?"}
    status, body, _ = http_req(f"{BACKEND_URL}/api/chat", method="POST", data=chat_payload)
    reply = body.get("answer", "") if isinstance(body, dict) else ""
    fallback_substr = "I don't have that information in Sree's Home Bakery's verified details"
    assert_test(status == 200 and fallback_substr in reply,
                "RAG Chatbot fires exact anti-hallucination fallback for unverified out-of-domain query", f"Reply: {reply}")

    print("=" * 70)
    print(f"VERIFICATION SUMMARY: {passed} PASSED, {failed} FAILED (TOTAL {passed + failed})")
    print("=" * 70)
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
