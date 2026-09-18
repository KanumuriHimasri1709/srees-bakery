"""
Authentication service for Sree's Home Bakery:
Password hashing with bcrypt and signed session tokens with itsdangerous.
"""
import os
import bcrypt
from typing import Optional, Dict, Any
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

SECRET_KEY = os.getenv("SESSION_SECRET", "srees-home-bakery-production-secret-key-kakinada-2026")
SALT = "srees-bakery-auth-salt"

_serializer = URLSafeTimedSerializer(SECRET_KEY, salt=SALT)
TOKEN_MAX_AGE = 86400 * 7  # 7 days

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: int, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role
    }
    return _serializer.dumps(payload)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        data = _serializer.loads(token, max_age=TOKEN_MAX_AGE)
        return data
    except (SignatureExpired, BadSignature, Exception):
        return None
