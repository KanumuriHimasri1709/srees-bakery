"""
SQLite database interface and schema management for Sree's Home Bakery.
Maintains pure enquiry-based orders (no customer registration/accounts),
admin authentication configuration, products, gallery, and offers.
"""
import sqlite3
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
import bcrypt

DB_PATH = Path(__file__).resolve().parent.parent.parent / "bakery.db"

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def check_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def init_db():
    """Initialize database tables, run migrations, and seed data."""
    with get_connection() as conn:
        cursor = conn.cursor()

        # 1. Admin Authentication Table (No customer users)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Drop old customer users table if it exists
        cursor.execute("DROP TABLE IF EXISTS users")

        # 2. Check and migrate enquiries table to exact required specification:
        # id, enquiry_id, customer_name, phone, product, flavour, size, eggless,
        # occasion, required_date, theme, colour, sweetness, delivery_required,
        # message, reference_image, status, created_at, updated_at
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='enquiries'")
        enquiries_exists = cursor.fetchone() is not None

        need_migration = False
        if enquiries_exists:
            cursor.execute("PRAGMA table_info(enquiries)")
            existing_cols = [row["name"] for row in cursor.fetchall()]
            if "enquiry_id" not in existing_cols or "customer_name" not in existing_cols:
                need_migration = True

        if need_migration:
            cursor.execute("ALTER TABLE enquiries RENAME TO enquiries_old")
            cursor.execute("""
                CREATE TABLE enquiries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    enquiry_id TEXT UNIQUE NOT NULL,
                    customer_name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    product TEXT,
                    flavour TEXT,
                    size TEXT,
                    eggless TEXT,
                    occasion TEXT,
                    required_date TEXT,
                    theme TEXT,
                    colour TEXT,
                    sweetness TEXT,
                    delivery_required TEXT,
                    message TEXT,
                    reference_image TEXT,
                    status TEXT DEFAULT 'Pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("""
                INSERT INTO enquiries (
                    id, enquiry_id, customer_name, phone, product, flavour, size,
                    eggless, occasion, required_date, theme, colour, sweetness,
                    delivery_required, message, reference_image, status, created_at, updated_at
                )
                SELECT 
                    id,
                    'SB-' || (1000 + id),
                    COALESCE(name, 'Customer'),
                    COALESCE(phone, 'N/A'),
                    product,
                    flavour,
                    size,
                    COALESCE(egg_preference, 'Eggless'),
                    occasion,
                    required_date,
                    theme,
                    colour,
                    sweetness,
                    COALESCE(delivery_required, 'Yes'),
                    COALESCE(additional_message, customization, message_on_cake, ''),
                    reference_image_url,
                    COALESCE(status, 'Pending'),
                    created_at,
                    COALESCE(updated_at, created_at)
                FROM enquiries_old
            """)
            cursor.execute("DROP TABLE enquiries_old")
        elif not enquiries_exists:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS enquiries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    enquiry_id TEXT UNIQUE NOT NULL,
                    customer_name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    product TEXT,
                    flavour TEXT,
                    size TEXT,
                    eggless TEXT,
                    occasion TEXT,
                    required_date TEXT,
                    theme TEXT,
                    colour TEXT,
                    sweetness TEXT,
                    delivery_required TEXT,
                    message TEXT,
                    reference_image TEXT,
                    status TEXT DEFAULT 'Pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

        # 3. Products table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                is_available INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 4. Gallery table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS gallery (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                src TEXT NOT NULL,
                label TEXT NOT NULL,
                category TEXT NOT NULL,
                ai_context TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 5. Offers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS offers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                discount_percent INTEGER DEFAULT 10,
                is_active INTEGER DEFAULT 1,
                terms TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()

    # Seed Admin & Verified Bakery Data
    _sync_admin_credentials()
    _seed_products()
    _seed_offers()
    _seed_gallery()

def _sync_admin_credentials():
    admin_email = os.getenv("ADMIN_EMAIL", "sreehomebakery@gmail.com").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "CHANGE_THIS_PASSWORD")
    hashed = hash_password(admin_password)

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, password_hash FROM admin_config WHERE email = ?", (admin_email,))
        row = cursor.fetchone()
        if not row:
            cursor.execute("""
                INSERT INTO admin_config (email, password_hash)
                VALUES (?, ?)
            """, (admin_email, hashed))
        else:
            if not check_password(admin_password, row["password_hash"]):
                cursor.execute("""
                    UPDATE admin_config SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE email = ?
                """, (hashed, admin_email))
        conn.commit()

def verify_admin_login(email: str, password: str) -> bool:
    admin_email = os.getenv("ADMIN_EMAIL", "sreehomebakery@gmail.com").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "CHANGE_THIS_PASSWORD")

    # Direct environment match
    if email.strip().lower() == admin_email and password == admin_password:
        return True

    # Database hash fallback
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash FROM admin_config WHERE email = ?", (email.strip().lower(),))
        row = cursor.fetchone()
        if row and check_password(password, row["password_hash"]):
            return True

    return False

# --- Enquiry Operations ---

def save_enquiry(data: Dict[str, Any]) -> Dict[str, Any]:
    """Save an unauthenticated customer order or custom cake enquiry directly to SQLite."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()

        # Calculate next sequential enquiry ID (e.g. SB-1001, SB-1002, ...)
        cursor.execute("SELECT MAX(id) as max_id FROM enquiries")
        row = cursor.fetchone()
        max_id = (row["max_id"] or 0)
        next_num = max_id + 1
        enquiry_id = f"SB-{1000 + next_num}"

        customer_name = (data.get("customer_name") or data.get("name") or "").strip()
        phone = (data.get("phone") or "").strip()
        product = data.get("product") or data.get("type") or "Custom Cake"
        flavour = data.get("flavour") or data.get("cakeFlavour")
        size = data.get("size")
        eggless = data.get("eggless") or data.get("eggPreference") or "Eggless"
        occasion = data.get("occasion")
        required_date = data.get("required_date") or data.get("requiredDate")
        theme = data.get("theme")
        colour = data.get("colour") or data.get("color")
        sweetness = data.get("sweetness")
        delivery_required = data.get("delivery_required") or data.get("deliveryRequired") or "Yes"
        message = data.get("message") or data.get("additionalMessage") or data.get("messageOnCake") or data.get("customization")
        reference_image = data.get("reference_image") or data.get("referenceImageUrl") or data.get("reference_image_url")
        status = data.get("status") or "Pending"

        cursor.execute("""
            INSERT INTO enquiries (
                enquiry_id, customer_name, phone, product, flavour, size,
                eggless, occasion, required_date, theme, colour, sweetness,
                delivery_required, message, reference_image, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            enquiry_id, customer_name, phone, product, flavour, size,
            eggless, occasion, required_date, theme, colour, sweetness,
            delivery_required, message, reference_image, status
        ))
        conn.commit()
        inserted_id = cursor.lastrowid

        return {
            "id": inserted_id,
            "enquiry_id": enquiry_id,
            "customer_name": customer_name,
            "phone": phone
        }

def get_all_enquiries(
    status: Optional[str] = None,
    search: Optional[str] = None,
    date_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Retrieve all enquiries with optional status, search, and date filters."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM enquiries WHERE 1=1"
        params: List[Any] = []

        if status and status != "All":
            query += " AND status = ?"
            params.append(status)

        if date_filter:
            query += " AND (required_date LIKE ? OR DATE(created_at) = ?)"
            params.append(f"%{date_filter}%")
            params.append(date_filter)

        query += " ORDER BY id DESC"
        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]

        if search:
            s = search.lower().strip()
            rows = [
                r for r in rows
                if s in (r.get("customer_name") or "").lower()
                or s in (r.get("phone") or "").lower()
                or s in (r.get("enquiry_id") or "").lower()
                or s in (r.get("product") or "").lower()
                or s in (r.get("flavour") or "").lower()
                or s in (r.get("theme") or "").lower()
            ]

        return rows

def get_enquiry_by_id(enquiry_id_or_id: Any) -> Optional[Dict[str, Any]]:
    """Get single enquiry by numeric ID or string enquiry_id (e.g. SB-1001)."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        if isinstance(enquiry_id_or_id, int) or (isinstance(enquiry_id_or_id, str) and enquiry_id_or_id.isdigit()):
            cursor.execute("SELECT * FROM enquiries WHERE id = ?", (int(enquiry_id_or_id),))
        else:
            cursor.execute("SELECT * FROM enquiries WHERE enquiry_id = ?", (str(enquiry_id_or_id),))
        row = cursor.fetchone()
        return dict(row) if row else None

def update_enquiry_status(enquiry_id_or_id: Any, status: str) -> bool:
    """Update and persist status in SQLite."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        if isinstance(enquiry_id_or_id, int) or (isinstance(enquiry_id_or_id, str) and enquiry_id_or_id.isdigit()):
            cursor.execute("""
                UPDATE enquiries SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (status, int(enquiry_id_or_id)))
        else:
            cursor.execute("""
                UPDATE enquiries SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE enquiry_id = ?
            """, (status, str(enquiry_id_or_id)))
        conn.commit()
        return cursor.rowcount > 0

def get_enquiry_stats() -> Dict[str, int]:
    """Calculate REAL database statistics directly from SQLite."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM enquiries")
        total = cursor.fetchone()["total"]

        statuses = [
            "Pending",
            "Reviewed",
            "Confirmed",
            "In Preparation",
            "Ready",
            "Completed",
            "Cancelled"
        ]
        counts = {}
        for s in statuses:
            cursor.execute("SELECT COUNT(*) as cnt FROM enquiries WHERE status = ?", (s,))
            key = s.lower().replace(" ", "_")
            counts[key] = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(DISTINCT phone) as cnt FROM enquiries")
        total_contacts = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM products")
        total_products = cursor.fetchone()["cnt"]

        return {
            "total": total,
            "pending": counts.get("pending", 0),
            "reviewed": counts.get("reviewed", 0),
            "confirmed": counts.get("confirmed", 0),
            "in_preparation": counts.get("in_preparation", 0),
            "ready": counts.get("ready", 0),
            "completed": counts.get("completed", 0),
            "cancelled": counts.get("cancelled", 0),
            "total_contacts": total_contacts,
            "total_products": total_products
        }

def get_enquiry_contacts(search: Optional[str] = None) -> List[Dict[str, Any]]:
    """Show customer contacts based on actual enquiries (no fake registered users)."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                phone,
                customer_name,
                COUNT(id) as enquiry_count,
                MAX(created_at) as last_enquiry_date,
                GROUP_CONCAT(enquiry_id, ', ') as enquiry_ids
            FROM enquiries
            GROUP BY phone
            ORDER BY last_enquiry_date DESC
        """)
        rows = [dict(row) for row in cursor.fetchall()]

        if search:
            s = search.lower().strip()
            rows = [
                r for r in rows
                if s in r["phone"].lower() or s in r["customer_name"].lower()
            ]

        return rows

# --- Product Operations ---

def get_all_products(available_only: bool = False) -> List[Dict[str, Any]]:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        if available_only:
            cursor.execute("SELECT * FROM products WHERE is_available = 1 ORDER BY category, id")
        else:
            cursor.execute("SELECT * FROM products ORDER BY category, id")
        return [dict(row) for row in cursor.fetchall()]

def get_product_by_id(product_id: int) -> Optional[Dict[str, Any]]:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def create_product(data: Dict[str, Any]) -> int:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO products (name, category, price, description, image_url, is_available)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data.get("name"),
            data.get("category"),
            data.get("price"),
            data.get("description"),
            data.get("image_url"),
            data.get("is_available", 1)
        ))
        conn.commit()
        return cursor.lastrowid

def update_product(product_id: int, data: Dict[str, Any]) -> bool:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        fields = []
        params = []
        for key in ["name", "category", "price", "description", "image_url", "is_available"]:
            if key in data and data[key] is not None:
                fields.append(f"{key} = ?")
                params.append(data[key])
        if not fields:
            return False
        params.append(product_id)
        query = f"UPDATE products SET {', '.join(fields)} WHERE id = ?"
        cursor.execute(query, params)
        conn.commit()
        return cursor.rowcount > 0

def delete_product(product_id: int) -> bool:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
        return cursor.rowcount > 0

# --- Gallery Operations ---

def get_all_gallery_items(category: Optional[str] = None) -> List[Dict[str, Any]]:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        if category and category != "All":
            cursor.execute("SELECT * FROM gallery WHERE category = ? ORDER BY id DESC", (category,))
        else:
            cursor.execute("SELECT * FROM gallery ORDER BY id ASC")
        return [dict(row) for row in cursor.fetchall()]

def add_gallery_item(data: Dict[str, Any]) -> int:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO gallery (src, label, category, ai_context)
            VALUES (?, ?, ?, ?)
        """, (
            data.get("src"),
            data.get("label"),
            data.get("category"),
            data.get("ai_context")
        ))
        conn.commit()
        return cursor.lastrowid

def delete_gallery_item(item_id: int) -> bool:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM gallery WHERE id = ?", (item_id,))
        conn.commit()
        return cursor.rowcount > 0

# --- Offers Operations ---

def get_active_offers() -> List[Dict[str, Any]]:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM offers WHERE is_active = 1 ORDER BY id ASC")
        return [dict(row) for row in cursor.fetchall()]

def get_all_offers() -> List[Dict[str, Any]]:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM offers ORDER BY id ASC")
        return [dict(row) for row in cursor.fetchall()]

def update_offer(offer_id: int, data: Dict[str, Any]) -> bool:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        fields = []
        params = []
        for key in ["title", "description", "discount_percent", "is_active", "terms"]:
            if key in data and data[key] is not None:
                fields.append(f"{key} = ?")
                params.append(data[key])
        if not fields:
            return False
        params.append(offer_id)
        query = f"UPDATE offers SET {', '.join(fields)} WHERE id = ?"
        cursor.execute(query, params)
        conn.commit()
        return cursor.rowcount > 0

# --- Seed Initial Verified Data ---

def _seed_products():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM products")
        if cursor.fetchone()["cnt"] > 0:
            return

        verified_products = [
            ("Vanilla", "Cakes", "½ kg ₹300 · 1 kg ₹550", "Classic vanilla sponge with luscious frosting. Egg and eggless options available.", "/assets/gallery/original-002.jpg"),
            ("Pineapple", "Cakes", "½ kg ₹350 · 1 kg ₹600", "Fresh whipped cream layered with tropical pineapple compote.", "/assets/gallery/original-040.jpg"),
            ("Strawberry", "Cakes", "½ kg ₹350 · 1 kg ₹600", "Delicate strawberry flavoured layers with fresh creamy frosting.", "/assets/gallery/original-032.jpg"),
            ("Butterscotch", "Cakes", "½ kg ₹400 · 1 kg ₹700", "Rich butterscotch sponge coated with golden caramel crunch.", "/assets/gallery/original-036.jpg"),
            ("Blueberry", "Cakes", "½ kg ₹400 · 1 kg ₹700", "Zesty blueberry glaze paired with pillowy vanilla sponge.", "/assets/gallery/original-012.jpg"),
            ("Chocolate", "Cakes", "½ kg ₹400 · 1 kg ₹750", "Decadent Dutch cocoa cake with rich chocolate ganache.", "/assets/gallery/original-023.jpg"),
            ("Rasmalai", "Cakes", "½ kg ₹350 · 1 kg ₹600", "Fusion celebration cake infused with aromatic cardamom and saffron rasmalai.", "/assets/gallery/original-010.jpg"),
            ("Black Forest", "Cakes", "½ kg ₹400 · 1 kg ₹800", "Traditional chocolate sponge layered with cherries and whipped cream.", "/assets/gallery/original-043.jpg"),
            ("Red Velvet", "Cakes", "½ kg ₹400 · 1 kg ₹800", "Velvety scarlet sponge with rich cream cheese frosting.", "/assets/gallery/original-039.jpg"),
            ("Tender Coconut", "Cakes", "½ kg ₹700 · 1 kg ₹1300", "Specialty bakery creation featuring fresh tender coconut malai layers.", "/assets/gallery/original-018.jpg"),
            ("Ragi Chocolate Cookies", "Cookies", "250 g · ₹210", "Nutritious finger millet cookies infused with cocoa.", "/assets/gallery/original-007.jpg"),
            ("Jowar Cookies", "Cookies", "250 g · ₹205", "Crispy sorghum millet cookies baked fresh.", "/assets/gallery/original-007.jpg"),
            ("Multigrain Cookies", "Cookies", "250 g · ₹249", "Wholesome blend of roasted whole grains and seeds.", "/assets/gallery/original-007.jpg"),
            ("Oats Ragi Cookies", "Cookies", "250 g · ₹245", "Hearty rolled oats combined with aromatic ragi flour.", "/assets/gallery/original-007.jpg"),
            ("Kesar Pista Cookies", "Cookies", "250 g · ₹275", "Infused with pure saffron and crunchy pistachio nuts.", "/assets/gallery/original-007.jpg"),
            ("Oats Almond Cookies", "Cookies", "250 g · ₹270", "Wholesome oats loaded with sliced California almonds.", "/assets/gallery/original-007.jpg"),
            ("Fruit Cookies", "Cookies", "250 g · ₹199", "Delightful buttery tea cookies packed with colourful candied fruits.", "/assets/gallery/original-007.jpg"),
            ("Red Velvet Cookies", "Cookies", "250 g · ₹220", "Chewy red velvet biscuits with white chocolate hints.", "/assets/gallery/original-007.jpg"),
            ("Double Choco Chips Cookies", "Cookies", "250 g · ₹280", "Rich dark chocolate cookie base studded with dark chips.", "/assets/gallery/original-007.jpg"),
            ("Oats Stuffed Chocolate Cookies", "Cookies", "250 g · ₹299", "Oatmeal shells filled with a molten chocolate center.", "/assets/gallery/original-007.jpg"),
            ("Oats Stuffed Peanut Cookies", "Cookies", "250 g · ₹280", "Crisp oat exterior filled with roasted peanut butter filling.", "/assets/gallery/original-007.jpg"),
            ("Choco Chip Cookies", "Cookies", "250 g · ₹249", "Golden, crispy traditional American style chocolate chip cookies.", "/assets/gallery/original-007.jpg"),
            ("Millet Cookies", "Cookies", "Price on request", "Verified Note: Only Millet Cookies are explicitly confirmed as having no sugar and no maida.", "/assets/gallery/original-007.jpg"),
            ("Brownie (Pack of 6)", "Brownies", "₹350", "Fudgy, melt-in-mouth dark chocolate brownies (pack of 6).", "/assets/gallery/original-037.jpg"),
            ("Chocolate Walnut Brownie (6 pcs)", "Brownies", "₹380", "Rich chocolate brownies packed with roasted Kashmiri walnuts.", "/assets/gallery/original-037.jpg"),
            ("Nutella Brownie (6 pcs)", "Brownies", "₹380", "Swirled with creamy hazelnut Nutella spread.", "/assets/gallery/original-037.jpg"),
            ("Double Chocolate Brownie (6 pcs)", "Brownies", "₹380", "Layered with both dark and milk chocolate chunks.", "/assets/gallery/original-037.jpg"),
            ("Dark / Plain Chocolates", "Chocolates", "10 pcs ₹130 · 20 pcs ₹260", "Smooth artisan dark chocolates molded by hand.", "/assets/gallery/original-038.jpg"),
            ("White Chocolates", "Chocolates", "10 pcs ₹160 · 20 pcs ₹290", "Creamy, velvety white chocolate treats.", "/assets/gallery/original-038.jpg"),
            ("Chocolates with Dry Fruits", "Chocolates", "10 pcs ₹200 · 20 pcs ₹380", "Artisan dark chocolate loaded with roasted cashews and almonds.", "/assets/gallery/original-038.jpg"),
            ("White Chocolates with Dry Fruits", "Chocolates", "10 pcs ₹200 · 20 pcs ₹380", "Sweet white chocolate enriched with premium dry fruits.", "/assets/gallery/original-038.jpg"),
            ("Double Shaded Chocolates", "Chocolates", "10 pcs ₹180 · 20 pcs ₹350", "Dual layer dark and white chocolate confection.", "/assets/gallery/original-038.jpg"),
            ("Kunafa Chocolate (50 g)", "Chocolates", "10 pcs ₹150 · 20 pcs Price on request", "Crisp toasted kunafa pastry blended with pistachio cream chocolate.", "/assets/gallery/original-038.jpg"),
            ("Apricot Delight", "Special Treats", "Mini ₹70 · Big ₹180", "Decadent Hyderabadi style apricot delicacy with cream.", "/assets/gallery/original-009.jpg"),
            ("Muffins", "Special Treats", "₹35 / piece", "Freshly baked soft bakery muffins.", "/assets/gallery/original-029.jpg"),
            ("Bento Cake", "Special Treats", "₹280", "Cute mini celebration cake in a takeaway bento box.", "/assets/gallery/original-004.jpg"),
            ("Birthday / Name Chocolate", "Special Treats", "₹280", "Handmade customized chocolate bars spelled with recipient name.", "/assets/gallery/original-038.jpg"),
        ]
        cursor.executemany("""
            INSERT INTO products (name, category, price, description, image_url)
            VALUES (?, ?, ?, ?, ?)
        """, verified_products)
        conn.commit()

def _seed_offers():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM offers")
        if cursor.fetchone()["cnt"] > 0:
            return
        cursor.execute("""
            INSERT INTO offers (title, description, discount_percent, is_active, terms)
            VALUES (?, ?, ?, ?, ?)
        """, (
            "Instagram First Order Discount",
            "Follow the bakery Instagram page and share it to receive 10% OFF on your first order.",
            10,
            1,
            "Valid for new customers placing their first order. Share screenshot upon confirmation."
        ))
        conn.commit()

def _seed_gallery():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM gallery")
        if cursor.fetchone()["cnt"] > 0:
            return
        gallery_items = [
            ("original-001.jpg", "Grand Celebration Cake", "Cakes", "grand tiered celebration cake"),
            ("original-002.jpg", "Floral Celebration Cake", "Cakes", "floral cake with cream rosettes"),
            ("original-003.jpg", "Festive Dessert Bake", "Special Treats", "festive artisan bake"),
            ("original-004.jpg", "Square Custom Cake", "Custom Cakes", "square custom theme cake"),
            ("original-005.jpg", "Artisan Pastry Slice", "Special Treats", "fresh pastry slice"),
            ("original-006.jpg", "Personalized Photo Cake", "Theme Cakes", "custom photo printed cake"),
            ("original-007.jpg", "Fresh Cookie Assortment", "Cookies", "variety of freshly baked cookies"),
            ("original-008.jpg", "Elegant Wedding Cake", "Cakes", "tiered wedding celebration cake"),
            ("original-009.jpg", "Packaged Dessert Treats", "Special Treats", "artisan sweet dessert jars"),
            ("original-010.jpg", "Purple Floral Theme Cake", "Theme Cakes", "purple floral birthday cake"),
            ("original-011.jpg", "Festive Sweet Confection", "Special Treats", "sweet bakery delight"),
            ("original-012.jpg", "Royal Blue Theme Cake", "Theme Cakes", "blue celebration cake"),
            ("original-013.jpg", "Celebration Cake Creation", "Birthday Cakes", "festive birthday design"),
            ("original-014.jpg", "Custom Message Cake", "Custom Cakes", "cake with customized pipe message"),
            ("original-015.jpg", "Artisan Cream Cake", "Cakes", "smooth whipped cream cake"),
            ("original-016.jpg", "Celebration Theme Bake", "Theme Cakes", "custom themed celebration bake"),
            ("original-017.jpg", "Tiered Event Cake", "Cakes", "multi-tier event cake"),
            ("original-018.jpg", "Signature Birthday Cake", "Birthday Cakes", "colourful birthday party cake"),
            ("original-019.jpg", "Pastel Celebration Cake", "Birthday Cakes", "pastel frosted birthday cake"),
            ("original-020.jpg", "Character Celebration Cake", "Theme Cakes", "custom kid cartoon character cake"),
            ("original-021.jpg", "Festive Occasion Cake", "Cakes", "elaborate festive celebration cake"),
            ("original-022.jpg", "Designer Floral Cake", "Custom Cakes", "handcrafted sugar flower cake"),
            ("original-023.jpg", "Chocolate Ganache Drip Cake", "Cakes", "decadent chocolate drip with toppings"),
            ("original-024.jpg", "Celebration Dessert Creation", "Special Treats", "specialty dessert bake"),
            ("original-025.jpg", "Party Theme Cake", "Theme Cakes", "special occasion themed cake"),
            ("original-026.jpg", "Custom Anniversary Cake", "Custom Cakes", "heart warming anniversary cake"),
            ("original-027.jpg", "Tiered Signature Celebration Cake", "Birthday Cakes", "stunning multi-tier celebration cake"),
            ("original-028.jpg", "Artisan Special Bake", "Special Treats", "specialty home bakery creation"),
            ("original-029.jpg", "Gourmet Cupcake Assortment", "Cupcakes", "fluffy cupcakes with buttercream swirls"),
            ("original-030.jpg", "Delicate Dessert Cup", "Special Treats", "artisan individual dessert cup"),
            ("original-031.jpg", "Vehicle Theme Birthday Cake", "Theme Cakes", "custom vehicle theme cake for boys"),
            ("original-032.jpg", "Blush Pink Celebration Cake", "Birthday Cakes", "pink birthday cake with macarons"),
            ("original-033.jpg", "Handcrafted Theme Creation", "Theme Cakes", "artisan themed celebration cake"),
            ("original-034.jpg", "Celebration Masterpiece", "Cakes", "masterpiece home bakery cake"),
            ("original-035.jpg", "Purple Lavender Custom Cake", "Custom Cakes", "custom purple cake with accents"),
            ("original-036.jpg", "Modern Celebration Cake", "Custom Cakes", "clean modern minimalist celebration cake"),
            ("original-037.jpg", "Fudgy Chocolate Brownie Batch", "Special Treats", "freshly baked chocolate brownies"),
            ("original-038.jpg", "Handcrafted Artisan Chocolates", "Chocolates", "handcrafted assorted chocolates"),
            ("original-039.jpg", "Rainbow Celebration Cake", "Birthday Cakes", "vibrant rainbow layered celebration cake"),
            ("original-040.jpg", "Pink Rosette Buttercream Cake", "Cakes", "rosette textured buttercream cake"),
            ("original-041.jpg", "Special Event Cake", "Birthday Cakes", "grand celebration birthday cake"),
            ("original-042.jpg", "Artisan Chocolate Treats", "Chocolates", "custom chocolates and bites"),
            ("original-043.jpg", "Birthday Chocolate Truffle Cake", "Cakes", "rich chocolate truffle birthday cake"),
            ("original-044.jpg", "Sweet Celebration Confection", "Special Treats", "mini bento dessert creation"),
            ("original-045.jpg", "Specialty Dessert Treat", "Special Treats", "freshly made artisanal treat"),
        ]
        data = [
            (f"/assets/gallery/{filename}", label, category, ai_ctx)
            for filename, label, category, ai_ctx in gallery_items
        ]
        cursor.executemany("""
            INSERT INTO gallery (src, label, category, ai_context)
            VALUES (?, ?, ?, ?)
        """, data)
        conn.commit()
