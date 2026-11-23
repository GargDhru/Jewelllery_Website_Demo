import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

from app.core.firebase import get_firestore_client, is_firebase_available
from app.core.security import hash_password
from app.core.config import settings

logger = logging.getLogger("aura.firebase_db")

def now_utc():
    return datetime.now(timezone.utc)

def format_doc(doc) -> Dict[str, Any]:
    """Converts a Firestore DocumentSnapshot into a python dict with id included."""
    if not doc.exists:
        return {}
    data = doc.to_dict() or {}
    data["id"] = doc.id
    # Format timestamps if any
    for k, v in list(data.items()):
        if hasattr(v, "to_datetime"):
            data[k] = v.to_datetime()
    return data

class DocumentObject:
    """
    Wrapper around a dictionary that allows both attribute access (obj.foo)
    and dict indexing (obj['foo']), making it compatible with Pydantic from_attributes=True.
    """
    def __init__(self, data: Optional[Dict[str, Any]] = None):
        object.__setattr__(self, "_data", data or {})
        for k, v in (data or {}).items():
            if isinstance(v, dict):
                object.__setattr__(self, k, DocumentObject(v))
            elif isinstance(v, list):
                object.__setattr__(self, k, [DocumentObject(item) if isinstance(item, dict) else item for item in v])
            else:
                object.__setattr__(self, k, v)

    def __getattr__(self, name):
        return self._data.get(name)

    def __getitem__(self, item):
        return self._data[item]

    def __contains__(self, item):
        return item in self._data

    def get(self, key, default=None):
        return self._data.get(key, default)

    def to_dict(self):
        return self._data

# ==============================================================================
# Category Service (Firestore)
# ==============================================================================
class FirestoreCategoryService:
    @staticmethod
    def list_categories(include_inactive: bool = False) -> List[Dict[str, Any]]:
        db = get_firestore_client()
        col = db.collection("categories")
        docs = col.stream()
        results = []
        for d in docs:
            cat = format_doc(d)
            if not include_inactive and not cat.get("is_active", True):
                continue
            results.append(cat)
        # Sort by display_order then name
        results.sort(key=lambda x: (x.get("display_order", 0), x.get("name", "")))
        return results

    @staticmethod
    def get_category(slug_or_id: str) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        # Direct ID lookup
        doc = db.collection("categories").document(slug_or_id).get()
        if doc.exists:
            return format_doc(doc)
        # By slug or name
        for query_field in ["slug", "name"]:
            docs = list(db.collection("categories").where(query_field, "==", slug_or_id).limit(1).stream())
            if docs:
                return format_doc(docs[0])
        return None

    @staticmethod
    def create_category(data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_firestore_client()
        cat_id = data.get("id") or str(uuid.uuid4())
        data["id"] = cat_id
        data["created_at"] = data.get("created_at") or now_utc()
        data["updated_at"] = now_utc()
        db.collection("categories").document(cat_id).set(data)
        return data

    @staticmethod
    def update_category(cat_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        ref = db.collection("categories").document(cat_id)
        if not ref.get().exists:
            return None
        data["updated_at"] = now_utc()
        ref.update(data)
        return format_doc(ref.get())

    @staticmethod
    def delete_category(cat_id: str) -> bool:
        db = get_firestore_client()
        ref = db.collection("categories").document(cat_id)
        if not ref.get().exists:
            return False
        ref.delete()
        return True


# ==============================================================================
# Product Service (Firestore)
# ==============================================================================
class FirestoreProductService:
    @staticmethod
    def list_products(
        category: Optional[str] = None,
        search: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        color: Optional[str] = None,
        material: Optional[str] = None,
        in_stock: Optional[bool] = None,
        is_featured: Optional[bool] = None,
        is_trending: Optional[bool] = None,
        is_new_arrival: Optional[bool] = None,
        sort: Optional[str] = "featured",
        skip: int = 0,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        db = get_firestore_client()
        products_col = db.collection("products")
        docs = products_col.stream()
        
        products = []
        for d in docs:
            p = format_doc(d)
            if not p.get("is_active", True):
                continue
            
            # Category filter
            if category:
                if category in ("new-arrivals", "new_arrivals"):
                    if not p.get("is_new_arrival"):
                        continue
                elif category in ("best-sellers", "best_sellers", "bestselling"):
                    if not (p.get("is_trending") or p.get("is_featured") or (p.get("rating", 0) >= 4.9)):
                        continue
                else:
                    cat_match = (
                        p.get("category_slug") == category or 
                        p.get("category_id") == category or
                        (p.get("category") and p["category"].get("slug") == category)
                    )
                    if not cat_match:
                        continue

            # Search filter
            if search:
                term = search.lower().strip()
                title = (p.get("title") or "").lower()
                desc = (p.get("description") or "").lower()
                sku = (p.get("sku") or "").lower()
                mat = (p.get("material") or "").lower()
                if term not in title and term not in desc and term not in sku and term not in mat:
                    continue

            # Price filters
            price = float(p.get("price", 0.0))
            if min_price is not None and price < min_price:
                continue
            if max_price is not None and price > max_price:
                continue

            # Other filters
            if color and (p.get("color") or "").lower() != color.lower():
                continue
            if material and material.lower() not in (p.get("material") or "").lower():
                continue
            if in_stock is True and p.get("stock_quantity", 0) <= 0:
                continue
            if is_featured is not None and p.get("is_featured") != is_featured:
                continue
            if is_trending is not None and p.get("is_trending") != is_trending:
                continue
            if is_new_arrival is not None and p.get("is_new_arrival") != is_new_arrival:
                continue

            products.append(p)

        # Sorting
        if sort == "price_asc":
            products.sort(key=lambda x: float(x.get("price", 0.0)))
        elif sort == "price_desc":
            products.sort(key=lambda x: float(x.get("price", 0.0)), reverse=True)
        elif sort == "newest":
            products.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
        elif sort in ("rating", "bestselling"):
            products.sort(key=lambda x: (float(x.get("rating", 0.0)), int(x.get("reviews_count", 0))), reverse=True)
        else: # featured
            products.sort(key=lambda x: (1 if x.get("is_featured") else 0, float(x.get("rating", 0.0))), reverse=True)

        return products[skip : skip + limit]

    @staticmethod
    def get_product(slug_or_id: str) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        # ID lookup
        doc = db.collection("products").document(slug_or_id).get()
        if doc.exists:
            return format_doc(doc)
        # Slug or SKU lookup
        for query_field in ["slug", "sku"]:
            docs = list(db.collection("products").where(query_field, "==", slug_or_id).limit(1).stream())
            if docs:
                return format_doc(docs[0])
        return None

    @staticmethod
    def create_product(data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_firestore_client()
        prod_id = data.get("id") or str(uuid.uuid4())
        data["id"] = prod_id
        data["created_at"] = data.get("created_at") or now_utc()
        data["updated_at"] = now_utc()
        
        # Normalize images array if passed as string URLs
        if "images" in data and isinstance(data["images"], list):
            formatted_images = []
            for idx, img in enumerate(data["images"]):
                if isinstance(img, str):
                    formatted_images.append({
                        "id": str(uuid.uuid4()),
                        "image_url": img,
                        "alt_text": data.get("title", ""),
                        "display_order": idx,
                        "is_primary": idx == 0
                    })
                elif isinstance(img, dict):
                    formatted_images.append(img)
            data["images"] = formatted_images

        db.collection("products").document(prod_id).set(data)
        return data

    @staticmethod
    def update_product(product_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        ref = db.collection("products").document(product_id)
        if not ref.get().exists:
            return None
        data["updated_at"] = now_utc()
        ref.update(data)
        return format_doc(ref.get())

    @staticmethod
    def delete_product(product_id: str) -> bool:
        db = get_firestore_client()
        ref = db.collection("products").document(product_id)
        if not ref.get().exists:
            return False
        ref.delete()
        return True

    @staticmethod
    def decrement_stock(product_id: str, quantity: int, variant_id: Optional[str] = None):
        db = get_firestore_client()
        ref = db.collection("products").document(product_id)
        doc = ref.get()
        if not doc.exists:
            return
        pdata = doc.to_dict()
        new_stock = max(0, int(pdata.get("stock_quantity", 0)) - quantity)
        updates = {"stock_quantity": new_stock, "updated_at": now_utc()}
        
        if variant_id and "variants" in pdata and isinstance(pdata["variants"], list):
            updated_variants = []
            for v in pdata["variants"]:
                if v.get("id") == variant_id:
                    v["stock_quantity"] = max(0, int(v.get("stock_quantity", 0)) - quantity)
                updated_variants.append(v)
            updates["variants"] = updated_variants

        ref.update(updates)


# ==============================================================================
# User & Auth Service (Firestore)
# ==============================================================================
class FirestoreUserService:
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        docs = list(db.collection("users").where("email", "==", email.lower().strip()).limit(1).stream())
        if docs:
            return format_doc(docs[0])
        return None

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        doc = db.collection("users").document(user_id).get()
        if doc.exists:
            return format_doc(doc)
        return None

    @staticmethod
    def create_user(data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_firestore_client()
        user_id = data.get("id") or str(uuid.uuid4())
        data["id"] = user_id
        data["email"] = data["email"].lower().strip()
        data["created_at"] = data.get("created_at") or now_utc()
        data["updated_at"] = now_utc()
        data["addresses"] = data.get("addresses", [])
        db.collection("users").document(user_id).set(data)
        return data

    @staticmethod
    def update_user(user_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        ref = db.collection("users").document(user_id)
        if not ref.get().exists:
            return None
        data["updated_at"] = now_utc()
        ref.update(data)
        return format_doc(ref.get())

    @staticmethod
    def delete_user(user_id: str) -> bool:
        db = get_firestore_client()
        ref = db.collection("users").document(user_id)
        if not ref.get().exists:
            return False
        ref.delete()
        return True

    @staticmethod
    def list_customers(skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        db = get_firestore_client()
        docs = db.collection("users").where("role", "==", "customer").stream()
        customers = [format_doc(d) for d in docs]
        customers.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
        return customers[skip : skip + limit]

    @staticmethod
    def add_address(user_id: str, address_data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_firestore_client()
        ref = db.collection("users").document(user_id)
        doc = ref.get()
        if not doc.exists:
            raise ValueError("User not found")
        user = doc.to_dict()
        addresses = user.get("addresses", [])
        
        addr_id = str(uuid.uuid4())
        address_data["id"] = addr_id
        address_data["user_id"] = user_id
        address_data["created_at"] = now_utc()
        
        if address_data.get("is_default", False):
            for a in addresses:
                a["is_default"] = False
        elif not addresses:
            address_data["is_default"] = True

        addresses.append(address_data)
        ref.update({"addresses": addresses, "updated_at": now_utc()})
        return address_data

    @staticmethod
    def delete_address(user_id: str, address_id: str) -> bool:
        db = get_firestore_client()
        ref = db.collection("users").document(user_id)
        doc = ref.get()
        if not doc.exists:
            return False
        user = doc.to_dict()
        addresses = [a for a in user.get("addresses", []) if a.get("id") != address_id]
        ref.update({"addresses": addresses, "updated_at": now_utc()})
        return True


# ==============================================================================
# Cart Service (Firestore)
# ==============================================================================
class FirestoreCartService:
    @staticmethod
    def get_or_create_cart(session_id: Optional[str], user_id: Optional[str]) -> Dict[str, Any]:
        db = get_firestore_client()
        col = db.collection("carts")
        
        # Find by user_id or session_id
        cart_doc = None
        if user_id:
            docs = list(col.where("user_id", "==", user_id).limit(1).stream())
            if docs:
                cart_doc = docs[0]
        if not cart_doc and session_id:
            docs = list(col.where("session_id", "==", session_id).limit(1).stream())
            if docs:
                cart_doc = docs[0]

        if cart_doc:
            return format_doc(cart_doc)

        cart_id = str(uuid.uuid4())
        new_cart = {
            "id": cart_id,
            "user_id": user_id,
            "session_id": session_id or f"sess_{uuid.uuid4().hex[:12]}",
            "items": [],
            "created_at": now_utc(),
            "updated_at": now_utc()
        }
        col.document(cart_id).set(new_cart)
        return new_cart

    @staticmethod
    def add_item(cart_id: str, item_data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_firestore_client()
        ref = db.collection("carts").document(cart_id)
        doc = ref.get()
        if not doc.exists:
            raise ValueError("Cart not found")
        cart = doc.to_dict()
        items = cart.get("items", [])
        
        # Check existing item
        prod_id = item_data["product_id"]
        var_id = item_data.get("variant_id")
        found = False
        for it in items:
            if it.get("product_id") == prod_id and it.get("variant_id") == var_id:
                it["quantity"] += int(item_data.get("quantity", 1))
                found = True
                break

        if not found:
            item_data["id"] = str(uuid.uuid4())
            item_data["created_at"] = now_utc()
            items.append(item_data)

        ref.update({"items": items, "updated_at": now_utc()})
        return format_doc(ref.get())

    @staticmethod
    def update_item_quantity(cart_id: str, item_id: str, quantity: int) -> Dict[str, Any]:
        db = get_firestore_client()
        ref = db.collection("carts").document(cart_id)
        doc = ref.get()
        if not doc.exists:
            raise ValueError("Cart not found")
        cart = doc.to_dict()
        items = cart.get("items", [])
        
        if quantity <= 0:
            items = [it for it in items if it.get("id") != item_id]
        else:
            for it in items:
                if it.get("id") == item_id:
                    it["quantity"] = quantity
                    break

        ref.update({"items": items, "updated_at": now_utc()})
        return format_doc(ref.get())

    @staticmethod
    def remove_item(cart_id: str, item_id: str) -> Dict[str, Any]:
        db = get_firestore_client()
        ref = db.collection("carts").document(cart_id)
        doc = ref.get()
        if not doc.exists:
            raise ValueError("Cart not found")
        cart = doc.to_dict()
        items = [it for it in cart.get("items", []) if it.get("id") != item_id]
        ref.update({"items": items, "updated_at": now_utc()})
        return format_doc(ref.get())

    @staticmethod
    def clear_cart(cart_id: str):
        db = get_firestore_client()
        db.collection("carts").document(cart_id).update({"items": [], "updated_at": now_utc()})


# ==============================================================================
# Order Service (Firestore)
# ==============================================================================
class FirestoreOrderService:
    @staticmethod
    def create_order(order_data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_firestore_client()
        order_id = order_data.get("id") or str(uuid.uuid4())
        order_data["id"] = order_id
        order_data["created_at"] = order_data.get("created_at") or now_utc()
        order_data["updated_at"] = now_utc()
        order_data["payments"] = order_data.get("payments", [])
        db.collection("orders").document(order_id).set(order_data)
        return order_data

    @staticmethod
    def get_order(order_id: str) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        doc = db.collection("orders").document(order_id).get()
        if doc.exists:
            return format_doc(doc)
        # Search by order_number
        docs = list(db.collection("orders").where("order_number", "==", order_id).limit(1).stream())
        if docs:
            return format_doc(docs[0])
        return None

    @staticmethod
    def list_user_orders(user_id: str) -> List[Dict[str, Any]]:
        db = get_firestore_client()
        docs = db.collection("orders").where("user_id", "==", user_id).stream()
        orders = [format_doc(d) for d in docs]
        orders.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
        return orders

    @staticmethod
    def list_all_orders(
        status: Optional[str] = None,
        payment_status: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        db = get_firestore_client()
        docs = db.collection("orders").stream()
        orders = []
        for d in docs:
            ord_dict = format_doc(d)
            if status and ord_dict.get("order_status") != status:
                continue
            if payment_status and ord_dict.get("payment_status") != payment_status:
                continue
            if search:
                term = search.lower()
                num = (ord_dict.get("order_number") or "").lower()
                email = (ord_dict.get("customer_email") or "").lower()
                phone = (ord_dict.get("customer_phone") or "").lower()
                if term not in num and term not in email and term not in phone:
                    continue
            orders.append(ord_dict)

        orders.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
        return orders[skip : skip + limit]

    @staticmethod
    def update_order_status(order_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        ref = db.collection("orders").document(order_id)
        if not ref.get().exists:
            return None
        updates["updated_at"] = now_utc()
        ref.update(updates)
        return format_doc(ref.get())

    @staticmethod
    def record_payment(order_id: str, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_firestore_client()
        ref = db.collection("orders").document(order_id)
        doc = ref.get()
        if not doc.exists:
            raise ValueError("Order not found")
        order = doc.to_dict()
        payments = order.get("payments", [])
        
        pay_id = str(uuid.uuid4())
        payment_data["id"] = pay_id
        payment_data["order_id"] = order_id
        payment_data["created_at"] = now_utc()
        payments.append(payment_data)

        updates = {
            "payments": payments,
            "payment_status": "paid" if payment_data.get("status") == "successful" else order.get("payment_status", "pending"),
            "order_status": "confirmed" if payment_data.get("status") == "successful" else order.get("order_status", "pending"),
            "updated_at": now_utc()
        }
        ref.update(updates)
        return payment_data


# ==============================================================================
# Coupon, Banner & Review Services (Firestore)
# ==============================================================================
class FirestoreCouponService:
    @staticmethod
    def list_coupons(include_inactive: bool = False) -> List[Dict[str, Any]]:
        db = get_firestore_client()
        docs = db.collection("coupons").stream()
        coupons = []
        for d in docs:
            c = format_doc(d)
            if not include_inactive and not c.get("is_active", True):
                continue
            coupons.append(c)
        return coupons

    @staticmethod
    def get_coupon(code: str) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        clean_code = code.strip().upper()
        docs = list(db.collection("coupons").where("code", "==", clean_code).limit(1).stream())
        if docs:
            return format_doc(docs[0])
        # Direct doc ID check
        doc = db.collection("coupons").document(code).get()
        if doc.exists:
            return format_doc(doc)
        return None

    @staticmethod
    def create_coupon(data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_firestore_client()
        cid = data.get("id") or str(uuid.uuid4())
        data["id"] = cid
        data["code"] = data["code"].strip().upper()
        data["created_at"] = now_utc()
        data["usage_count"] = 0
        db.collection("coupons").document(cid).set(data)
        return data

    @staticmethod
    def delete_coupon(coupon_id: str) -> bool:
        db = get_firestore_client()
        ref = db.collection("coupons").document(coupon_id)
        if not ref.get().exists:
            return False
        ref.delete()
        return True

    @staticmethod
    def increment_usage(coupon_code: str):
        db = get_firestore_client()
        docs = list(db.collection("coupons").where("code", "==", coupon_code.strip().upper()).limit(1).stream())
        if docs:
            ref = docs[0].reference
            cnt = docs[0].to_dict().get("usage_count", 0)
            ref.update({"usage_count": cnt + 1})


class FirestoreBannerService:
    @staticmethod
    def list_banners(include_inactive: bool = False) -> List[Dict[str, Any]]:
        db = get_firestore_client()
        docs = db.collection("banners").stream()
        banners = []
        for d in docs:
            b = format_doc(d)
            if not include_inactive and not b.get("is_active", True):
                continue
            banners.append(b)
        banners.sort(key=lambda x: x.get("display_order", 0))
        return banners

    @staticmethod
    def create_banner(data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_firestore_client()
        bid = data.get("id") or str(uuid.uuid4())
        data["id"] = bid
        data["created_at"] = now_utc()
        db.collection("banners").document(bid).set(data)
        return data

    @staticmethod
    def delete_banner(banner_id: str) -> bool:
        db = get_firestore_client()
        ref = db.collection("banners").document(banner_id)
        if not ref.get().exists:
            return False
        ref.delete()
        return True


class FirestoreReviewService:
    @staticmethod
    def list_reviews_by_product(product_id: str) -> List[Dict[str, Any]]:
        db = get_firestore_client()
        docs = db.collection("reviews").where("product_id", "==", product_id).stream()
        reviews = [format_doc(d) for d in docs if d.to_dict().get("status", "approved") == "approved"]
        reviews.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
        return reviews

    @staticmethod
    def create_review(data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_firestore_client()
        rid = data.get("id") or str(uuid.uuid4())
        data["id"] = rid
        data["created_at"] = now_utc()
        data["status"] = data.get("status", "approved")
        db.collection("reviews").document(rid).set(data)
        FirestoreReviewService.recalculate_product_rating(data["product_id"])
        return data

    @staticmethod
    def delete_review(review_id: str) -> bool:
        db = get_firestore_client()
        ref = db.collection("reviews").document(review_id)
        doc = ref.get()
        if not doc.exists:
            return False
        product_id = doc.to_dict().get("product_id")
        ref.delete()
        if product_id:
            FirestoreReviewService.recalculate_product_rating(product_id)
        return True

    @staticmethod
    def recalculate_product_rating(product_id: str):
        db = get_firestore_client()
        docs = list(db.collection("reviews").where("product_id", "==", product_id).stream())
        approved = [d.to_dict() for d in docs if d.to_dict().get("status") == "approved"]
        if not approved:
            return
        total = sum(r.get("rating", 5) for r in approved)
        avg = round(total / len(approved), 1)
        db.collection("products").document(product_id).update({
            "rating": avg,
            "reviews_count": len(approved)
        })


# ==============================================================================
# Admin Dashboard Analytics (Firestore)
# ==============================================================================
class FirestoreAdminService:
    @staticmethod
    def get_dashboard_stats() -> Dict[str, Any]:
        db = get_firestore_client()
        
        # 1. Orders
        order_docs = list(db.collection("orders").stream())
        orders = [format_doc(d) for d in order_docs]
        
        total_revenue = sum(
            float(o.get("total_amount", 0.0)) for o in orders 
            if o.get("payment_status") == "paid"
        )
        total_orders = len(orders)
        delivered_orders = sum(1 for o in orders if o.get("order_status") == "delivered")
        pending_orders = sum(1 for o in orders if o.get("order_status") == "pending")
        aov = round(total_revenue / total_orders, 2) if total_orders > 0 else 0.0

        # Recent 5 orders
        orders_sorted = sorted(orders, key=lambda x: x.get("created_at") or datetime.min, reverse=True)
        recent_orders = orders_sorted[:5]

        # 2. Customers
        customer_docs = list(db.collection("users").where("role", "==", "customer").stream())
        total_customers = len(customer_docs)

        # 3. Products
        prod_docs = list(db.collection("products").stream())
        prods = [format_doc(d) for d in prod_docs]
        total_products = len(prods)
        low_stock_products = sum(1 for p in prods if int(p.get("stock_quantity", 0)) < 10)

        # 4. 7-Day Revenue Trend
        now = now_utc()
        days_map = {}
        for i in range(6, -1, -1):
            day_dt = now - timedelta(days=i)
            day_str = day_dt.strftime("%Y-%m-%d")
            day_label = day_dt.strftime("%b %d")
            days_map[day_str] = {"date": day_str, "label": day_label, "revenue": 0.0, "orders": 0}

        for o in orders:
            cat_dt = o.get("created_at")
            if cat_dt:
                dstr = cat_dt.strftime("%Y-%m-%d")
                if dstr in days_map and o.get("payment_status") == "paid":
                    days_map[dstr]["revenue"] += float(o.get("total_amount", 0.0))
                    days_map[dstr]["orders"] += 1

        revenue_by_day = [
            {
                "date": v["label"],
                "revenue": round(v["revenue"], 2),
                "orders": v["orders"]
            }
            for v in days_map.values()
        ]

        # 5. Sales by Category
        sales_by_cat = {}
        for o in orders:
            if o.get("payment_status") == "paid":
                for item in o.get("items", []):
                    # We can categorize by product
                    cname = item.get("category_name", "Jewellery")
                    sales_by_cat[cname] = sales_by_cat.get(cname, 0.0) + float(item.get("total_price", 0.0))

        cat_breakdown = [{"category": k, "sales": round(v, 2)} for k, v in sales_by_cat.items()] or [
            {"category": "Earrings", "sales": round(total_revenue * 0.35, 2)},
            {"category": "Necklaces", "sales": round(total_revenue * 0.40, 2)},
            {"category": "Rings & Bracelets", "sales": round(total_revenue * 0.25, 2)}
        ]

        return {
            "total_revenue": round(total_revenue, 2),
            "total_orders": total_orders,
            "total_customers": total_customers,
            "total_products": total_products,
            "delivered_orders": delivered_orders,
            "average_order_value": aov,
            "pending_orders": pending_orders,
            "low_stock_products": low_stock_products,
            "recent_orders": recent_orders,
            "revenue_by_day": revenue_by_day,
            "sales_by_category": cat_breakdown
        }
