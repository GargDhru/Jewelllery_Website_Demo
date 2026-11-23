import uuid
import logging
from datetime import datetime, timezone
from app.core.firebase import get_firestore_client, is_firebase_available
from app.core.security import hash_password
from app.core.config import settings

logger = logging.getLogger("aura.firebase_seeder")

def seed_firestore_initial_data():
    """
    Seeds initial luxury data into Firestore if collections are empty:
    - Master Admin (dhrugar@gmail.com)
    - Demo Customer (patron@auraatelier.com)
    - 10 Luxury Categories
    - Products with galleries & variants
    - Coupons & Discounts
    - Promotional Banners
    - Verified Customer Reviews
    """
    if not is_firebase_available():
        return False

    db = get_firestore_client()
    now = datetime.now(timezone.utc)

    # 1. Seed or Verify Users
    # Auto-purge legacy placeholder admin if exists
    legacy_admin = list(db.collection("users").where("email", "==", "admin@auraatelier.com").stream())
    for doc in legacy_admin:
        doc.reference.delete()
        logger.info("Purged legacy admin@auraatelier.com from Firestore.")

    # Master Admin
    admin_docs = list(db.collection("users").where("email", "==", settings.ADMIN_EMAIL).stream())
    if not admin_docs:
        admin_id = str(uuid.uuid4())
        db.collection("users").document(admin_id).set({
            "id": admin_id,
            "email": settings.ADMIN_EMAIL,
            "hashed_password": hash_password(settings.ADMIN_PASSWORD),
            "full_name": settings.ADMIN_NAME,
            "phone": "+91 98765 43210",
            "role": "admin",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
            "is_active": True,
            "is_verified": True,
            "created_at": now,
            "updated_at": now,
            "addresses": []
        })
        logger.info(f"✓ Master Admin seeded in Firestore: {settings.ADMIN_EMAIL}")
    else:
        # Ensure password and admin role remain valid
        admin_ref = admin_docs[0].reference
        admin_ref.update({
            "hashed_password": hash_password(settings.ADMIN_PASSWORD),
            "role": "admin",
            "is_active": True,
            "updated_at": now
        })

    # Demo Customer
    cust_docs = list(db.collection("users").where("email", "==", "patron@auraatelier.com").stream())
    if not cust_docs:
        cust_id = str(uuid.uuid4())
        db.collection("users").document(cust_id).set({
            "id": cust_id,
            "email": "patron@auraatelier.com",
            "hashed_password": hash_password("Customer@2024"),
            "full_name": "Lady Gwendolyn",
            "phone": "+91 9988776655",
            "role": "customer",
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
            "is_active": True,
            "is_verified": True,
            "created_at": now,
            "updated_at": now,
            "addresses": []
        })
        logger.info("✓ Demo Customer seeded in Firestore: patron@auraatelier.com")

    # 2. Seed Categories
    cat_snapshot = list(db.collection("categories").limit(1).stream())
    category_slug_map = {}

    categories_data = [
        {
            "name": "Earrings",
            "slug": "earrings",
            "description": "From radiant chandelier drops to everyday anti-tarnish Huggies and studs handcrafted in 18K gold finish.",
            "image_url": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "banner_url": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1600&q=80",
            "display_order": 1,
            "is_active": True
        },
        {
            "name": "Necklaces",
            "slug": "necklaces",
            "description": "Statement collar pieces, layered gold chains, and regal Kundan chokers created for modern royalty.",
            "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "banner_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80",
            "display_order": 2,
            "is_active": True
        },
        {
            "name": "Rings",
            "slug": "rings",
            "description": "Stackable bands, solitaire zirconia rings, and bespoke cocktail statement rings that command attention.",
            "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
            "banner_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=80",
            "display_order": 3,
            "is_active": True
        },
        {
            "name": "Bracelets",
            "slug": "bracelets",
            "description": "Artisan cuffs, tennis bracelets, charm links, and delicate wrist adornments with everlasting shimmer.",
            "image_url": "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "banner_url": "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=1600&q=80",
            "display_order": 4,
            "is_active": True
        },
        {
            "name": "Pendant Sets",
            "slug": "pendant-sets",
            "description": "Harmonious combinations of delicate pendant chains and matching stud earrings for effortless grace.",
            "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "banner_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
            "display_order": 5,
            "is_active": True
        },
        {
            "name": "Anklets",
            "slug": "anklets",
            "description": "Graceful ghungroo bells, minimalistic curb chains, and pearl-lined payals for contemporary footsteps.",
            "image_url": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
            "banner_url": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1600&q=80",
            "display_order": 6,
            "is_active": True
        },
        {
            "name": "Jewellery Sets",
            "slug": "jewellery-sets",
            "description": "Full heirloom ensembles featuring matching necklace, earrings, maang tikka, and bracelet.",
            "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "banner_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80",
            "display_order": 7,
            "is_active": True
        },
        {
            "name": "Gift Collections",
            "slug": "gift-collections",
            "description": "Elegantly boxed signature gift hampers, customized anniversary editions, and festive treasures.",
            "image_url": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
            "banner_url": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80",
            "display_order": 8,
            "is_active": True
        },
        {
            "name": "New Arrivals",
            "slug": "new-arrivals",
            "description": "Our latest seasonal drops straight from the atelier workshops, reflecting world-class trends.",
            "image_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "banner_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1600&q=80",
            "display_order": 9,
            "is_active": True
        },
        {
            "name": "Best Sellers",
            "slug": "best-sellers",
            "description": "Celebrated creations beloved by over 25,000 discerning patrons across the globe.",
            "image_url": "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "banner_url": "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1600&q=80",
            "display_order": 10,
            "is_active": True
        }
    ]

    if not cat_snapshot:
        for cdata in categories_data:
            cid = str(uuid.uuid4())
            cdata["id"] = cid
            cdata["created_at"] = now
            cdata["updated_at"] = now
            db.collection("categories").document(cid).set(cdata)
            category_slug_map[cdata["slug"]] = cid
        logger.info("✓ 10 Categories seeded in Firestore.")
    else:
        # Build category map from existing
        for doc in db.collection("categories").stream():
            d = doc.to_dict()
            if "slug" in d:
                category_slug_map[d["slug"]] = doc.id

    # 3. Seed Products
    prod_snapshot = list(db.collection("products").limit(1).stream())
    if not prod_snapshot:
        products_data = [
            {
                "title": "Aura Soleil Chandelier Earrings",
                "slug": "aura-soleil-chandelier-earrings",
                "sku": "AURA-ER-001",
                "category_slug": "earrings",
                "short_description": "Handcrafted cascading chandelier drops with cubic zirconia and 18K champagne gold PVD plating.",
                "description": "Inspired by Mediterranean sunsets, the Aura Soleil Chandelier Earrings reflect dazzling brilliance with every subtle movement. Crafted in anti-tarnish stainless steel dipped in 18K champagne gold, adorned with master-cut AAA zirconia stones. Waterproof, hypoallergenic, and lightweight for whole-day wear.",
                "price": 2899.0,
                "compare_at_price": 4499.0,
                "cost_price": 950.0,
                "stock_quantity": 24,
                "material": "Stainless Steel & AAA Grade Zirconia",
                "plating": "18K Gold PVD Anti-Tarnish",
                "color": "Champagne Gold",
                "dimensions": "6.2 cm x 2.4 cm",
                "weight": "14 grams pair",
                "care_instructions": "Store in the provided velvet pouch. Clean with a dry microfiber cloth.",
                "is_featured": True,
                "is_trending": True,
                "is_new_arrival": True,
                "rating": 4.9,
                "reviews_count": 38,
                "images": [
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Celeste Baroque Pearl Choker Necklace",
                "slug": "celeste-baroque-pearl-choker-necklace",
                "sku": "AURA-NK-002",
                "category_slug": "necklaces",
                "short_description": "Irregular organic freshwater pearls framed by 18K gold hammered sculptural beads.",
                "description": "The Celeste Choker reinterprets traditional pearls into high-fashion architectural sculpture. Each natural freshwater baroque pearl is hand-selected for unique luster and paired with 18K gold-plated molten brass beads. Finished with an adjustable signature Aura lobster clasp.",
                "price": 3799.0,
                "compare_at_price": 5999.0,
                "cost_price": 1200.0,
                "stock_quantity": 18,
                "material": "Freshwater Pearls & Brass",
                "plating": "18K Gold PVD Anti-Tarnish",
                "color": "Ivory & Champagne Gold",
                "dimensions": "38 cm + 7 cm extender",
                "weight": "28 grams",
                "care_instructions": "Keep away from harsh perfumes. Wipe with damp cloth.",
                "is_featured": True,
                "is_trending": True,
                "is_new_arrival": False,
                "rating": 5.0,
                "reviews_count": 52,
                "images": [
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Elysian Solitaire Marquise Ring",
                "slug": "elysian-solitaire-marquise-ring",
                "sku": "AURA-RG-003",
                "category_slug": "rings",
                "short_description": "A striking elongated marquise cut diamond-simulant on a tapered 18K gold band.",
                "description": "An ode to timeless glamour, the Elysian Ring features an elongated 3-carat equivalent marquise-cut solitaire held securely in a six-prong micro-pave basket. Flawless sparkle, waterproof coating, and comfortable ergonomic inner contour.",
                "price": 2199.0,
                "compare_at_price": 3299.0,
                "cost_price": 600.0,
                "stock_quantity": 30,
                "material": "Sterling Silver 925 base",
                "plating": "18K Yellow Gold Dip",
                "color": "Champagne Gold",
                "dimensions": "Available in sizes 6, 7, 8",
                "weight": "4.5 grams",
                "care_instructions": "Suitable for daily wear and water contact.",
                "is_featured": True,
                "is_trending": False,
                "is_new_arrival": True,
                "rating": 4.8,
                "reviews_count": 27,
                "images": [
                    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Imperial Roman Coin & Paperclip Bracelet",
                "slug": "imperial-roman-coin-paperclip-bracelet",
                "sku": "AURA-BR-004",
                "category_slug": "bracelets",
                "short_description": "Dual-layer modern paperclip link chain with an embossed antique Roman medallion.",
                "description": "A modern talisman for the confident woman. This curated piece brings together our best-selling elongated link paperclip chain with an intricately embossed coin pendant showcasing classical Greco-Roman motifs. Waterproof and hypoallergenic.",
                "price": 2499.0,
                "compare_at_price": 3899.0,
                "cost_price": 750.0,
                "stock_quantity": 15,
                "material": "Titanium Steel",
                "plating": "18K Real Gold Vacuum Ion Plated",
                "color": "Warm Gold",
                "dimensions": "16 cm + 4 cm extension",
                "weight": "16 grams",
                "care_instructions": "100% Anti-Tarnish. Wear in pool, gym, and shower with ease.",
                "is_featured": False,
                "is_trending": True,
                "is_new_arrival": True,
                "rating": 4.9,
                "reviews_count": 44,
                "images": [
                    "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Nocturne Emerald & Diamond Pendant Set",
                "slug": "nocturne-emerald-diamond-pendant-set",
                "sku": "AURA-PD-005",
                "category_slug": "pendant-sets",
                "short_description": "Vibrant emerald green baguette crystal surrounded by micro-pavé crystals with matching studs.",
                "description": "Reminiscent of high-jewellery red carpet statements, the Nocturne set combines rich forest emerald green center crystals framed by a halo of brilliant lab-grown crystals. Comes with a complimentary fine box chain and matching stud earrings.",
                "price": 3499.0,
                "compare_at_price": 5499.0,
                "cost_price": 1100.0,
                "stock_quantity": 20,
                "material": "Brass Alloy & Crystal Glass",
                "plating": "18K Gold Electroplated",
                "color": "Emerald Green Paint & Gold",
                "dimensions": "Pendant 2.2 cm, Chain 45 cm, Studs 1.2 cm",
                "weight": "18 grams",
                "care_instructions": "Store in airtight box after use.",
                "is_featured": True,
                "is_trending": True,
                "is_new_arrival": False,
                "rating": 5.0,
                "reviews_count": 61,
                "images": [
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Aethelgard Royal Kundan Bridal Set",
                "slug": "aethelgard-royal-kundan-bridal-set",
                "sku": "AURA-ST-006",
                "category_slug": "jewellery-sets",
                "short_description": "Exquisite bridal choker, matching chandelier jhumkas, and delicate maang tikka in jadau finish.",
                "description": "Crafted for unforgettable weddings and grand celebrations. Hand-set Kundan polki stones with meenakari enameling on the reverse side, trimmed with clusters of natural shell pearls. Delivered in a bespoke velvet keepsake trunk.",
                "price": 8999.0,
                "compare_at_price": 14999.0,
                "cost_price": 3400.0,
                "stock_quantity": 10,
                "material": "Copper Brass with Jadau Kundan & Meenakari",
                "plating": "22K Micro Gold Plated",
                "color": "Antique Gold & Pearl White",
                "dimensions": "Choker Width 5 cm, Jhumka Length 8 cm",
                "weight": "185 grams complete set",
                "care_instructions": "Avoid moisture and contact with hair spray.",
                "is_featured": True,
                "is_trending": True,
                "is_new_arrival": False,
                "rating": 4.9,
                "reviews_count": 89,
                "images": [
                    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Siren Delicate Pearl & Gold Anklet",
                "slug": "siren-delicate-pearl-gold-anklet",
                "sku": "AURA-AK-007",
                "category_slug": "anklets",
                "short_description": "Waterproof snake chain anklet dotted with tiny freshwater seed pearls.",
                "description": "Barefoot luxury at its finest. Designed to drape effortlessly on the ankle, featuring miniature freshwater seed pearls interspersed along a fluid waterproof snake chain. Safe for beach vacations, showers, and daily wear.",
                "price": 1699.0,
                "compare_at_price": 2499.0,
                "cost_price": 450.0,
                "stock_quantity": 35,
                "material": "Stainless Steel 316L & Seed Pearls",
                "plating": "18K Gold PVD Coating",
                "color": "Champagne Gold",
                "dimensions": "21 cm + 5 cm extension",
                "weight": "8 grams",
                "care_instructions": "100% Anti-Tarnish. Never fades or turns green.",
                "is_featured": False,
                "is_trending": False,
                "is_new_arrival": True,
                "rating": 4.7,
                "reviews_count": 19,
                "images": [
                    "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "The Golden Muse Atelier Gift Box",
                "slug": "the-golden-muse-atelier-gift-box",
                "sku": "AURA-GF-008",
                "category_slug": "gift-collections",
                "short_description": "Signature gift hamper with 1 necklace, 1 bracelet, scented candle, and handwritten gift note.",
                "description": "Curated for birthdays, anniversaries, and bridesmaids. Includes our best-selling herringbone necklace, tennis bracelet, a soy wax vanilla rose scented candle, wrapped in an embossed champagne box with gold foil satin ribbon.",
                "price": 4999.0,
                "compare_at_price": 7999.0,
                "cost_price": 1800.0,
                "stock_quantity": 12,
                "material": "Luxury Gift Set",
                "plating": "18K Gold Anti-Tarnish",
                "color": "Gold & Rose Blush Paint",
                "dimensions": "Gift Box 22 x 18 x 8 cm",
                "weight": "650 grams",
                "care_instructions": "Ready to gift. Comes with luxury authenticity card.",
                "is_featured": True,
                "is_trending": False,
                "is_new_arrival": True,
                "rating": 5.0,
                "reviews_count": 42,
                "images": [
                    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Serpentis Textured Chunky Gold Ring",
                "slug": "serpentis-textured-chunky-gold-ring",
                "sku": "AURA-RG-009",
                "category_slug": "rings",
                "short_description": "Architectural ribbed dome ring with high-gloss 18K gold luster.",
                "description": "A cult favorite amongst fashion editors. The Serpentis Ring features a sculptural ribbed croissant silhouette with ergonomic tapering for maximum comfort. Stacks gorgeously with thin eternity bands.",
                "price": 1899.0,
                "compare_at_price": 2799.0,
                "cost_price": 500.0,
                "stock_quantity": 40,
                "material": "Stainless Steel",
                "plating": "18K Gold PVD Vacuum Plated",
                "color": "Yellow Gold",
                "dimensions": "Ring sizes 6, 7, 8 (Adjustable open back)",
                "weight": "7.5 grams",
                "care_instructions": "Waterproof, perfume safe, sweatproof.",
                "is_featured": False,
                "is_trending": True,
                "is_new_arrival": False,
                "rating": 4.8,
                "reviews_count": 76,
                "images": [
                    "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Astraea Starburst Diamond Hoops",
                "slug": "astraea-starburst-diamond-hoops",
                "sku": "AURA-ER-010",
                "category_slug": "earrings",
                "short_description": "Medium clicker hoops featuring suspended celestial starburst charms set with pavé stones.",
                "description": "Reach for the cosmos. The Astraea Hoops carry removable celestial starburst charms engraved with central cubic zirconia crystals. Wear them as classic gold huggies or keep the charms for celestial sparkle.",
                "price": 2399.0,
                "compare_at_price": 3699.0,
                "cost_price": 700.0,
                "stock_quantity": 25,
                "material": "Sterling Silver 925 core",
                "plating": "18K Champagne Gold Vermeil",
                "color": "Champagne Gold",
                "dimensions": "Hoop diameter 18 mm, charm 12 mm",
                "weight": "6 grams",
                "care_instructions": "Hypoallergenic. Safe for sensitive ears.",
                "is_featured": True,
                "is_trending": True,
                "is_new_arrival": True,
                "rating": 4.9,
                "reviews_count": 31,
                "images": [
                    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Lumière Tennis Chain Necklace",
                "slug": "lumiere-tennis-chain-necklace",
                "sku": "AURA-NK-011",
                "category_slug": "necklaces",
                "short_description": "Continuous stream of 3mm brilliant round cut crystals in high-polish four-prong basket.",
                "description": "Nothing whispers luxury quite like a flawless tennis necklace. Featuring 108 precision-cut simulated diamonds that sparkle from every angle, finished with a double-safety lock clasp.",
                "price": 4299.0,
                "compare_at_price": 6999.0,
                "cost_price": 1400.0,
                "stock_quantity": 16,
                "material": "Brass Alloy & AAA Zirconia",
                "plating": "White Rhodium & 18K Gold duo",
                "color": "Platinum / Champagne Gold",
                "dimensions": "40 cm length, 3 mm stone width",
                "weight": "32 grams",
                "care_instructions": "Keep away from harsh swimming pool chlorine.",
                "is_featured": True,
                "is_trending": True,
                "is_new_arrival": False,
                "rating": 5.0,
                "reviews_count": 94,
                "images": [
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Ophelia Resin & Gold Foil Petal Bracelet",
                "slug": "ophelia-resin-gold-foil-petal-bracelet",
                "sku": "AURA-BR-012",
                "category_slug": "bracelets",
                "short_description": "Hand-poured crystalline resin preserving genuine gold leaf and botanicals on an adjustable chain.",
                "description": "Honoring the iconic resin artistry of resionaura. Each cabochon is uniquely cast by hand with 24K real gold leaf flakes suspended within high-clarity optical resin. Every piece is an irreplaceable work of wearable art.",
                "price": 2699.0,
                "compare_at_price": 3999.0,
                "cost_price": 800.0,
                "stock_quantity": 22,
                "material": "Optical Craft Resin & 24K Gold Leaf",
                "plating": "18K Gold Plated Brass Chain",
                "color": "Amber Gold & Clear",
                "dimensions": "Cabochon 15 mm, length 17 + 5 cm",
                "weight": "11 grams",
                "care_instructions": "Avoid extreme heat or abrasive surfaces.",
                "is_featured": True,
                "is_trending": True,
                "is_new_arrival": True,
                "rating": 4.9,
                "reviews_count": 58,
                "images": [
                    "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
                ]
            }
        ]

        for pdata in products_data:
            pid = str(uuid.uuid4())
            cat_slug = pdata.pop("category_slug")
            raw_images = pdata.pop("images", [])
            cat_id = category_slug_map.get(cat_slug)

            # Images
            formatted_images = [
                {
                    "id": str(uuid.uuid4()),
                    "image_url": img_url,
                    "alt_text": f"{pdata['title']} view {idx + 1}",
                    "display_order": idx,
                    "is_primary": (idx == 0)
                }
                for idx, img_url in enumerate(raw_images)
            ]

            # Variants
            variants = [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Champagne Gold / Standard",
                    "sku": f"{pdata['sku']}-CG",
                    "color": "Champagne Gold",
                    "size": "Standard",
                    "price": pdata["price"],
                    "stock_quantity": pdata["stock_quantity"],
                    "is_active": True
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Rose Gold / Standard",
                    "sku": f"{pdata['sku']}-RG",
                    "color": "Rose Gold",
                    "size": "Standard",
                    "price": pdata["price"],
                    "stock_quantity": pdata["stock_quantity"],
                    "is_active": True
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Platinum Silver / Standard",
                    "sku": f"{pdata['sku']}-PS",
                    "color": "Platinum Silver",
                    "size": "Standard",
                    "price": pdata["price"],
                    "stock_quantity": pdata["stock_quantity"],
                    "is_active": True
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Emerald Paint Finish / Standard",
                    "sku": f"{pdata['sku']}-EM",
                    "color": "Emerald Green Paint",
                    "size": "Standard",
                    "price": pdata["price"],
                    "stock_quantity": pdata["stock_quantity"],
                    "is_active": True
                }
            ]

            pdata["id"] = pid
            pdata["category_id"] = cat_id
            pdata["category_slug"] = cat_slug
            pdata["images"] = formatted_images
            pdata["variants"] = variants
            pdata["created_at"] = now
            pdata["updated_at"] = now
            pdata["is_active"] = True

            db.collection("products").document(pid).set(pdata)

        logger.info("✓ Luxury Products seeded in Firestore.")

    # 4. Seed Coupons
    if not list(db.collection("coupons").limit(1).stream()):
        coupons = [
            {
                "code": "AURA10",
                "description": "10% discount on all orders above ₹1,999",
                "discount_type": "percentage",
                "discount_value": 10.0,
                "min_purchase": 1999.0,
                "max_discount": 1000.0,
                "is_active": True
            },
            {
                "code": "WELCOME10",
                "description": "Special 10% welcome gift for first-time shoppers",
                "discount_type": "percentage",
                "discount_value": 10.0,
                "min_purchase": 999.0,
                "max_discount": 500.0,
                "is_active": True
            },
            {
                "code": "FESTIVE20",
                "description": "Festive indulgence! 20% off on orders above ₹4,999",
                "discount_type": "percentage",
                "discount_value": 20.0,
                "min_purchase": 4999.0,
                "max_discount": 2500.0,
                "is_active": True
            },
            {
                "code": "FREESHIP",
                "description": "Free premium insured express delivery",
                "discount_type": "flat",
                "discount_value": 149.0,
                "min_purchase": 500.0,
                "is_active": True
            }
        ]
        for c in coupons:
            cid = str(uuid.uuid4())
            c["id"] = cid
            c["usage_count"] = 0
            c["created_at"] = now
            db.collection("coupons").document(cid).set(c)
        logger.info("✓ Coupons seeded in Firestore.")

    # 5. Seed Banners
    if not list(db.collection("banners").limit(1).stream()):
        banners = [
            {
                "title": "The Art of Modern Handcrafted Adornment",
                "subtitle": "Exquisite 18K Gold Plated & Anti-Tarnish Demi-Fine Jewellery Crafted for Contemporary Queens.",
                "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1800&q=80",
                "cta_text": "Explore Collection",
                "cta_link": "/shop",
                "display_order": 1,
                "is_active": True
            },
            {
                "title": "Elegance in Every Detail",
                "subtitle": "Resin, Baroque Pearls & Gold Leaf Atelier Creations.",
                "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=80",
                "cta_text": "Shop Best Sellers",
                "cta_link": "/shop?sort=bestselling",
                "display_order": 2,
                "is_active": True
            }
        ]
        for b in banners:
            bid = str(uuid.uuid4())
            b["id"] = bid
            b["created_at"] = now
            db.collection("banners").document(bid).set(b)
        logger.info("✓ Promotional Banners seeded in Firestore.")

    # 6. Seed Reviews
    if not list(db.collection("reviews").limit(1).stream()):
        prod_docs = list(db.collection("products").limit(4).stream())
        sample_reviews = [
            ("Ananya Sharma", 5, "Breathtaking Craftsmanship!", "The chandelier earrings are even more radiant in person. The gold tone isn't too yellow, it's that subtle champagne shade. I wore them to a wedding and received compliments all night!"),
            ("Pooja Singhania", 5, "100% Anti-Tarnish Tested!", "I have worn the paperclip bracelet daily for 3 months including while showering, and it has not tarnished or turned my wrist green at all. Worth every rupee."),
            ("Rhea Kapoor", 5, "Luxury Unboxing Experience", "The velvet packaging, gold foil box, and certificates made it feel like receiving a high jewellery parcel from Paris. Impeccable finish."),
            ("Dr. Meera Nambiar", 5, "Exquisite Pearls", "The baroque pearl choker is pure poetry. Heavyweight, genuine organic luster, and the clasp is remarkably secure. Will definitely order again.")
        ]
        for idx, pdoc in enumerate(prod_docs):
            if idx < len(sample_reviews):
                name, rating, title, comm = sample_reviews[idx]
                rid = str(uuid.uuid4())
                db.collection("reviews").document(rid).set({
                    "id": rid,
                    "product_id": pdoc.id,
                    "customer_name": name,
                    "rating": rating,
                    "title": title,
                    "comment": comm,
                    "verified_purchase": True,
                    "status": "approved",
                    "created_at": now
                })
        logger.info("✓ Customer Reviews seeded in Firestore.")

    return True
