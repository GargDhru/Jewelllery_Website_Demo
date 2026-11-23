#!/usr/bin/env python3
"""
Aura Atelier — SQLite to Firebase Firestore Migration Tool
Transfers all existing SQLite data (categories, products, variants, images, users,
orders, coupons, reviews, banners) into Google Cloud / Firebase Firestore.

Usage:
    python migrate_to_firebase.py [--db-path ./aura_jewellery.db] [--dry-run]
"""

import sys
import os
import json
import sqlite3
import argparse
from datetime import datetime, timezone

# Ensure backend root is in Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.firebase import initialize_firebase, is_firebase_available, get_firestore_client
from app.core.config import settings

def parse_iso_or_now(val):
    if not val:
        return datetime.now(timezone.utc)
    if isinstance(val, datetime):
        return val
    try:
        return datetime.fromisoformat(str(val))
    except Exception:
        return datetime.now(timezone.utc)

def migrate_data(db_path: str, dry_run: bool = False):
    print("=" * 70)
    print("  AURA ATELIER — SQLITE TO FIREBASE FIRESTORE MIGRATION")
    print("=" * 70)

    if not os.path.exists(db_path):
        # Check parent folder or backend folder
        alt = os.path.join(os.path.dirname(__file__), "aura_jewellery.db")
        if os.path.exists(alt):
            db_path = alt
        else:
            print(f"❌ SQLite database not found at {db_path}")
            return False

    print(f"📂 Source SQLite DB: {os.path.abspath(db_path)}")
    print(f"🧪 Dry Run Mode: {'YES (No changes written)' if dry_run else 'NO (Writing to Firestore)'}")

    if not dry_run:
        print("\n⏳ Initializing Firebase connection...")
        if not initialize_firebase():
            print("❌ Firebase could not be initialized.")
            print("Please ensure one of the following is configured:")
            print("  1. FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string)")
            print("  2. serviceAccountKey.json placed in backend/ directory")
            print("  3. FIREBASE_PROJECT_ID env var")
            return False
        firestore_db = get_firestore_client()
        print("✓ Connected to Firebase Firestore successfully!\n")
    else:
        firestore_db = None

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    stats = {}

    try:
        # -------------------------------------------------------------
        # 1. Categories
        # -------------------------------------------------------------
        cursor.execute("SELECT * FROM categories")
        categories = [dict(row) for row in cursor.fetchall()]
        print(f"📦 Found {len(categories)} Categories in SQLite")
        for cat in categories:
            cat_id = cat["id"]
            cat["created_at"] = parse_iso_or_now(cat.get("created_at"))
            cat["updated_at"] = parse_iso_or_now(cat.get("updated_at"))
            cat["is_active"] = bool(cat.get("is_active", 1))
            cat["display_order"] = int(cat.get("display_order") or 0)
            if not dry_run:
                firestore_db.collection("categories").document(cat_id).set(cat)
        stats["categories"] = len(categories)

        # -------------------------------------------------------------
        # 2. Users & Addresses
        # -------------------------------------------------------------
        cursor.execute("SELECT * FROM users")
        users = [dict(row) for row in cursor.fetchall()]
        print(f"👤 Found {len(users)} Users in SQLite")
        for u in users:
            uid = u["id"]
            u["created_at"] = parse_iso_or_now(u.get("created_at"))
            u["updated_at"] = parse_iso_or_now(u.get("updated_at"))
            u["is_active"] = bool(u.get("is_active", 1))
            u["is_verified"] = bool(u.get("is_verified", 1))

            # Fetch user addresses
            cursor.execute("SELECT * FROM addresses WHERE user_id = ?", (uid,))
            addrs = [dict(row) for row in cursor.fetchall()]
            for a in addrs:
                a["is_default"] = bool(a.get("is_default", 0))
                a["created_at"] = parse_iso_or_now(a.get("created_at"))
            u["addresses"] = addrs

            if not dry_run:
                firestore_db.collection("users").document(uid).set(u)
        stats["users"] = len(users)

        # -------------------------------------------------------------
        # 3. Products, Images & Variants
        # -------------------------------------------------------------
        cursor.execute("SELECT * FROM products")
        products = [dict(row) for row in cursor.fetchall()]
        print(f"💎 Found {len(products)} Products in SQLite")
        for p in products:
            pid = p["id"]
            p["created_at"] = parse_iso_or_now(p.get("created_at"))
            p["updated_at"] = parse_iso_or_now(p.get("updated_at"))
            p["is_featured"] = bool(p.get("is_featured", 0))
            p["is_trending"] = bool(p.get("is_trending", 0))
            p["is_new_arrival"] = bool(p.get("is_new_arrival", 0))
            p["is_active"] = bool(p.get("is_active", 1))
            p["price"] = float(p.get("price") or 0.0)
            if p.get("compare_at_price"):
                p["compare_at_price"] = float(p["compare_at_price"])
            if p.get("cost_price"):
                p["cost_price"] = float(p["cost_price"])
            p["stock_quantity"] = int(p.get("stock_quantity") or 0)
            p["rating"] = float(p.get("rating") or 5.0)
            p["reviews_count"] = int(p.get("reviews_count") or 0)

            # Images
            cursor.execute("SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC", (pid,))
            images = [dict(row) for row in cursor.fetchall()]
            for img in images:
                img["is_primary"] = bool(img.get("is_primary", 0))
                img["created_at"] = parse_iso_or_now(img.get("created_at"))
            p["images"] = images

            # Variants
            cursor.execute("SELECT * FROM product_variants WHERE product_id = ?", (pid,))
            variants = [dict(row) for row in cursor.fetchall()]
            for var in variants:
                var["is_active"] = bool(var.get("is_active", 1))
                var["stock_quantity"] = int(var.get("stock_quantity") or 0)
                if var.get("price"):
                    var["price"] = float(var["price"])
                var["created_at"] = parse_iso_or_now(var.get("created_at"))
            p["variants"] = variants

            if not dry_run:
                firestore_db.collection("products").document(pid).set(p)
        stats["products"] = len(products)

        # -------------------------------------------------------------
        # 4. Orders, Items & Payments
        # -------------------------------------------------------------
        cursor.execute("SELECT * FROM orders")
        orders = [dict(row) for row in cursor.fetchall()]
        print(f"🛍️  Found {len(orders)} Orders in SQLite")
        for o in orders:
            oid = o["id"]
            o["created_at"] = parse_iso_or_now(o.get("created_at"))
            o["updated_at"] = parse_iso_or_now(o.get("updated_at"))
            o["subtotal"] = float(o.get("subtotal") or 0.0)
            o["total_amount"] = float(o.get("total_amount") or 0.0)
            o["discount_amount"] = float(o.get("discount_amount") or 0.0)
            o["shipping_fee"] = float(o.get("shipping_fee") or 0.0)
            o["tax_amount"] = float(o.get("tax_amount") or 0.0)

            # Parse JSON fields
            for jf in ["shipping_address", "billing_address"]:
                if o.get(jf) and isinstance(o[jf], str):
                    try:
                        o[jf] = json.loads(o[jf])
                    except Exception:
                        pass

            # Items
            cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (oid,))
            items = [dict(row) for row in cursor.fetchall()]
            for it in items:
                it["unit_price"] = float(it.get("unit_price") or 0.0)
                it["total_price"] = float(it.get("total_price") or 0.0)
                it["quantity"] = int(it.get("quantity") or 1)
            o["items"] = items

            # Payments
            cursor.execute("SELECT * FROM payments WHERE order_id = ?", (oid,))
            payments = [dict(row) for row in cursor.fetchall()]
            for pay in payments:
                pay["amount"] = float(pay.get("amount") or 0.0)
                pay["created_at"] = parse_iso_or_now(pay.get("created_at"))
            o["payments"] = payments

            if not dry_run:
                firestore_db.collection("orders").document(oid).set(o)
        stats["orders"] = len(orders)

        # -------------------------------------------------------------
        # 5. Coupons
        # -------------------------------------------------------------
        cursor.execute("SELECT * FROM coupons")
        coupons = [dict(row) for row in cursor.fetchall()]
        print(f"🏷️  Found {len(coupons)} Coupons in SQLite")
        for c in coupons:
            cid = c["id"]
            c["created_at"] = parse_iso_or_now(c.get("created_at"))
            c["valid_from"] = parse_iso_or_now(c.get("valid_from"))
            if c.get("valid_until"):
                c["valid_until"] = parse_iso_or_now(c["valid_until"])
            c["is_active"] = bool(c.get("is_active", 1))
            c["discount_value"] = float(c.get("discount_value") or 0.0)
            c["min_purchase"] = float(c.get("min_purchase") or 0.0)
            if c.get("max_discount"):
                c["max_discount"] = float(c["max_discount"])
            c["usage_count"] = int(c.get("usage_count") or 0)
            if not dry_run:
                firestore_db.collection("coupons").document(cid).set(c)
        stats["coupons"] = len(coupons)

        # -------------------------------------------------------------
        # 6. Banners
        # -------------------------------------------------------------
        cursor.execute("SELECT * FROM banners")
        banners = [dict(row) for row in cursor.fetchall()]
        print(f"🎨 Found {len(banners)} Banners in SQLite")
        for b in banners:
            bid = b["id"]
            b["created_at"] = parse_iso_or_now(b.get("created_at"))
            b["is_active"] = bool(b.get("is_active", 1))
            b["display_order"] = int(b.get("display_order") or 0)
            if not dry_run:
                firestore_db.collection("banners").document(bid).set(b)
        stats["banners"] = len(banners)

        # -------------------------------------------------------------
        # 7. Reviews
        # -------------------------------------------------------------
        cursor.execute("SELECT * FROM reviews")
        reviews = [dict(row) for row in cursor.fetchall()]
        print(f"⭐ Found {len(reviews)} Reviews in SQLite")
        for r in reviews:
            rid = r["id"]
            r["created_at"] = parse_iso_or_now(r.get("created_at"))
            r["verified_purchase"] = bool(r.get("verified_purchase", 1))
            r["rating"] = int(r.get("rating") or 5)
            if not dry_run:
                firestore_db.collection("reviews").document(rid).set(r)
        stats["reviews"] = len(reviews)

    finally:
        conn.close()

    print("\n" + "=" * 70)
    print("  MIGRATION SUMMARY")
    print("=" * 70)
    for entity, count in stats.items():
        print(f"  • {entity.capitalize():<15}: {count} migrated")

    if dry_run:
        print("\n💡 This was a dry run. To execute live migration, run without --dry-run:")
        print("   python migrate_to_firebase.py")
    else:
        print("\n✨ ALL DATA HAS BEEN SUCCESSFULLY MIGRATED TO FIREBASE FIRESTORE! ✨")

    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate SQLite DB to Firebase Firestore")
    parser.add_argument("--db-path", default="aura_jewellery.db", help="Path to aura_jewellery.db")
    parser.add_argument("--dry-run", action="store_true", help="Preview records without writing to Firestore")
    args = parser.parse_args()

    migrate_data(args.db_path, args.dry_run)
