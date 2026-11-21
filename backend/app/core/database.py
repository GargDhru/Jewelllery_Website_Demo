import asyncio
from datetime import datetime, timezone
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, func, delete

from app.core.config import settings
from app.models.models import (
    Base, User, Category, Product, ProductImage, ProductVariant,
    Coupon, Banner, Review, Order, OrderItem
)
from app.core.security import hash_password

# Helper to format PostgreSQL URLs for asyncpg if standard postgres:// or postgresql:// is passed
def get_async_database_url(url: str) -> str:
    if not url:
        return "sqlite+aiosqlite:///./aura_jewellery.db"
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

db_url = get_async_database_url(settings.DATABASE_URL)

# Setup async SQLAlchemy engine
connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}
engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def seed_initial_data(session: AsyncSession):
    # Purge any legacy placeholder admin accounts
    await session.execute(delete(User).where(User.email == "admin@auraatelier.com"))
    
    # Check if admin already exists
    admin_result = await session.execute(select(User).where(User.email == settings.ADMIN_EMAIL))
    admin_user = admin_result.scalars().first()
    if not admin_user:
        admin_user = User(
            email=settings.ADMIN_EMAIL,
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            full_name=settings.ADMIN_NAME,
            phone="+91 98765 43210",
            role="admin",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
            is_active=True,
            is_verified=True
        )
        session.add(admin_user)
    else:
        admin_user.hashed_password = hash_password(settings.ADMIN_PASSWORD)
        admin_user.role = "admin"
        admin_user.is_active = True
        session.add(admin_user)

    # Check if demo customer exists
    customer_res = await session.execute(select(User).where(User.email == "patron@auraatelier.com"))
    if not customer_res.scalars().first():
        demo_cust = User(
            email="patron@auraatelier.com",
            hashed_password=hash_password("Customer@2024"),
            full_name="Lady Gwendolyn",
            phone="+91 9988776655",
            role="customer",
            avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
            is_active=True,
            is_verified=True
        )
        session.add(demo_cust)

    await session.commit()

    # Check if categories exist
    cat_result = await session.execute(select(func.count(Category.id)))
    if cat_result.scalar() == 0:
        categories_data = [
            {
                "name": "Earrings",
                "slug": "earrings",
                "description": "From radiant chandelier drops to everyday anti-tarnish Huggies and studs handcrafted in 18K gold finish.",
                "image_url": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
                "banner_url": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1600&q=80",
                "display_order": 1
            },
            {
                "name": "Necklaces",
                "slug": "necklaces",
                "description": "Statement collar pieces, layered gold chains, and regal Kundan chokers created for modern royalty.",
                "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
                "banner_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80",
                "display_order": 2
            },
            {
                "name": "Rings",
                "slug": "rings",
                "description": "Stackable bands, solitaire zirconia rings, and bespoke cocktail statement rings that command attention.",
                "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
                "banner_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=80",
                "display_order": 3
            },
            {
                "name": "Bracelets",
                "slug": "bracelets",
                "description": "Artisan cuffs, tennis bracelets, charm links, and delicate wrist adornments with everlasting shimmer.",
                "image_url": "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
                "banner_url": "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=1600&q=80",
                "display_order": 4
            },
            {
                "name": "Pendant Sets",
                "slug": "pendant-sets",
                "description": "Harmonious combinations of delicate pendant chains and matching stud earrings for effortless grace.",
                "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                "banner_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
                "display_order": 5
            },
            {
                "name": "Anklets",
                "slug": "anklets",
                "description": "Graceful ghungroo bells, minimalistic curb chains, and pearl-lined payals for contemporary footsteps.",
                "image_url": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
                "banner_url": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1600&q=80",
                "display_order": 6
            },
            {
                "name": "Jewellery Sets",
                "slug": "jewellery-sets",
                "description": "Full heirloom ensembles featuring matching necklace, earrings, maang tikka, and bracelet.",
                "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
                "banner_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80",
                "display_order": 7
            },
            {
                "name": "Gift Collections",
                "slug": "gift-collections",
                "description": "Elegantly boxed signature gift hampers, customized anniversary editions, and festive treasures.",
                "image_url": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
                "banner_url": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80",
                "display_order": 8
            },
            {
                "name": "New Arrivals",
                "slug": "new-arrivals",
                "description": "Our latest seasonal drops straight from the atelier workshops, reflecting world-class trends.",
                "image_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
                "banner_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1600&q=80",
                "display_order": 9
            },
            {
                "name": "Best Sellers",
                "slug": "best-sellers",
                "description": "Celebrated creations beloved by over 25,000 discerning patrons across the globe.",
                "image_url": "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
                "banner_url": "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1600&q=80",
                "display_order": 10
            }
        ]

        created_cats = {}
        for cdata in categories_data:
            cat = Category(**cdata)
            session.add(cat)
            created_cats[cat.slug] = cat

        await session.commit()
        for cat in created_cats.values():
            await session.refresh(cat)

        # Products Seed Data with 5-6 Real Images each & Rich Color/Paint Finishes
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
            cat_slug = pdata.pop("category_slug")
            images = pdata.pop("images", [])
            category_obj = created_cats.get(cat_slug)
            
            prod = Product(
                **pdata,
                category_id=category_obj.id if category_obj else None
            )
            session.add(prod)
            await session.flush()

            # Add 5-6 images per product
            for idx, img_url in enumerate(images):
                img = ProductImage(
                    product_id=prod.id,
                    image_url=img_url,
                    alt_text=f"{prod.title} view {idx + 1}",
                    display_order=idx,
                    is_primary=(idx == 0)
                )
                session.add(img)

            # Add rich multi-color and plating paint variants
            variants_to_add = [
                ProductVariant(
                    product_id=prod.id,
                    title="Champagne Gold / Standard",
                    color="Champagne Gold",
                    size="Standard",
                    price=prod.price,
                    stock_quantity=prod.stock_quantity
                ),
                ProductVariant(
                    product_id=prod.id,
                    title="Rose Gold / Standard",
                    color="Rose Gold",
                    size="Standard",
                    price=prod.price,
                    stock_quantity=prod.stock_quantity
                ),
                ProductVariant(
                    product_id=prod.id,
                    title="Platinum Silver / Standard",
                    color="Platinum Silver",
                    size="Standard",
                    price=prod.price,
                    stock_quantity=prod.stock_quantity
                ),
                ProductVariant(
                    product_id=prod.id,
                    title="Emerald Paint Finish / Standard",
                    color="Emerald Green Paint",
                    size="Standard",
                    price=prod.price,
                    stock_quantity=prod.stock_quantity
                )
            ]
            for v in variants_to_add:
                session.add(v)

        await session.commit()

    # Seed Coupons
    coupon_result = await session.execute(select(func.count(Coupon.id)))
    if coupon_result.scalar() == 0:
        coupons = [
            Coupon(
                code="AURA10",
                description="10% discount on all orders above ₹1,999",
                discount_type="percentage",
                discount_value=10.0,
                min_purchase=1999.0,
                max_discount=1000.0,
                is_active=True
            ),
            Coupon(
                code="WELCOME10",
                description="Special 10% welcome gift for first-time shoppers",
                discount_type="percentage",
                discount_value=10.0,
                min_purchase=999.0,
                max_discount=500.0,
                is_active=True
            ),
            Coupon(
                code="FESTIVE20",
                description="Festive indulgence! 20% off on orders above ₹4,999",
                discount_type="percentage",
                discount_value=20.0,
                min_purchase=4999.0,
                max_discount=2500.0,
                is_active=True
            ),
            Coupon(
                code="FREESHIP",
                description="Free premium insured express delivery",
                discount_type="flat",
                discount_value=149.0,
                min_purchase=500.0,
                is_active=True
            )
        ]
        for c in coupons:
            session.add(c)
        await session.commit()

    # Seed Banners
    banner_result = await session.execute(select(func.count(Banner.id)))
    if banner_result.scalar() == 0:
        banners = [
            Banner(
                title="The Art of Modern Handcrafted Adornment",
                subtitle="Exquisite 18K Gold Plated & Anti-Tarnish Demi-Fine Jewellery Crafted for Contemporary Queens.",
                image_url="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1800&q=80",
                cta_text="Explore Collection",
                cta_link="/shop",
                display_order=1,
                is_active=True
            ),
            Banner(
                title="Elegance in Every Detail",
                subtitle="Resin, Baroque Pearls & Gold Leaf Atelier Creations.",
                image_url="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=80",
                cta_text="Shop Best Sellers",
                cta_link="/shop?sort=bestselling",
                display_order=2,
                is_active=True
            )
        ]
        for b in banners:
            session.add(b)
        await session.commit()

    # Seed initial authentic reviews
    reviews_count = await session.execute(select(func.count(Review.id)))
    if reviews_count.scalar() == 0:
        prod_result = await session.execute(select(Product).limit(4))
        prods = prod_result.scalars().all()
        sample_reviews = [
            ("Ananya Sharma", 5, "Breathtaking Craftsmanship!", "The chandelier earrings are even more radiant in person. The gold tone isn't too yellow, it's that subtle champagne shade. I wore them to a wedding and received compliments all night!"),
            ("Pooja Singhania", 5, "100% Anti-Tarnish Tested!", "I have worn the paperclip bracelet daily for 3 months including while showering, and it has not tarnished or turned my wrist green at all. Worth every rupee."),
            ("Rhea Kapoor", 5, "Luxury Unboxing Experience", "The velvet packaging, gold foil box, and certificates made it feel like receiving a high jewellery parcel from Paris. Impeccable finish."),
            ("Dr. Meera Nambiar", 5, "Exquisite Pearls", "The baroque pearl choker is pure poetry. Heavyweight, genuine organic luster, and the clasp is remarkably secure. Will definitely order again.")
        ]
        for idx, p in enumerate(prods):
            if idx < len(sample_reviews):
                name, rating, title, comm = sample_reviews[idx]
                rev = Review(
                    product_id=p.id,
                    customer_name=name,
                    rating=rating,
                    title=title,
                    comment=comm,
                    verified_purchase=True,
                    status="approved"
                )
                session.add(rev)
        await session.commit()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)
