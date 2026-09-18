"""
Service to load and serve verified bakery data from data/ directory.
"""
import json
from pathlib import Path
from typing import Dict, Any, List

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"

def load_json_file(filename: str) -> Any:
    file_path = DATA_DIR / filename
    if not file_path.exists():
        return {}
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_business_info() -> Dict[str, Any]:
    return load_json_file("business_info.json")

def get_menu_data() -> Dict[str, Any]:
    return load_json_file("menu.json")

def get_delivery_info() -> Dict[str, Any]:
    return load_json_file("delivery.json")

def get_faqs() -> List[Dict[str, str]]:
    return load_json_file("faqs.json")

def get_offers() -> Dict[str, Any]:
    return load_json_file("offers.json")

def get_verified_menu_text() -> str:
    txt_path = DATA_DIR / "menu_verified.txt"
    if txt_path.exists():
        with open(txt_path, "r", encoding="utf-8") as f:
            return f.read()
    return ""
