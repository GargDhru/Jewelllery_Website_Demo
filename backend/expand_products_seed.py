"""
Seed expansion script: adds 40+ new luxury products ensuring every single category
(Earrings, Rings, Necklaces, Bracelets, Pendants/Pendant Sets, Anklets, Jewellery Sets, Gift Collections)
has at least 5-6 products, with 5-6 professional jewellery photos each, plus comprehensive colour variants!
"""
import sqlite3
import uuid
from datetime import datetime, timezone

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

conn = sqlite3.connect('e:/Jewelleryweb/aura_jewellery.db')
c = conn.cursor()

# Get category mapping: slug -> id
c.execute('SELECT slug, id FROM categories')
cats = dict(c.fetchall())

NEW_PRODUCTS = [
    # ── EARRINGS (Already has 2, adding 4 more -> total 6) ───────────────────
    {
        "title": "Verona Hammered Gold Teardrop Earrings",
        "slug": "verona-hammered-gold-teardrop-earrings",
        "sku": "AURA-ER-013",
        "category_slug": "earrings",
        "short_description": "Sculptural molten teardrops with a rich hammered texture and warm 18K gold luster.",
        "description": "The Verona Teardrops capture the organic beauty of molten gold. Handcrafted with an anti-tarnish protective barrier over recycled stainless steel, these lightweight statement earrings reflect light from every angle without weighing down your lobes.",
        "price": 2499.0,
        "compare_at_price": 3699.0,
        "cost_price": 800.0,
        "stock_quantity": 28,
        "material": "Stainless Steel Base",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Gold",
        "dimensions": "4.8 cm x 2.1 cm",
        "weight": "9 grams pair",
        "care_instructions": "Keep in velvet pouch. Safe in fresh water.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 4.9,
        "reviews_count": 42,
        "images": [
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Solis Sunburst Pearl Drop Earrings",
        "slug": "solis-sunburst-pearl-drop-earrings",
        "sku": "AURA-ER-014",
        "category_slug": "earrings",
        "short_description": "Golden radiant sun ray motifs suspending luminous freshwater baroque teardrop pearls.",
        "description": "Evoking celestial splendor, Solis pairs radiant 18K gold sun rays with baroque pearls that shimmer with natural iridescence. Each pearl is organic and hand-selected for unmatched luster.",
        "price": 3199.0,
        "compare_at_price": 4899.0,
        "cost_price": 1050.0,
        "stock_quantity": 20,
        "material": "Freshwater Pearls & Brass",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Pearl White",
        "dimensions": "5.5 cm length",
        "weight": "11 grams pair",
        "care_instructions": "Avoid alcohol-based perfumes directly on pearls.",
        "is_featured": True,
        "is_trending": False,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 29,
        "images": [
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Athena Pavé Huggie Hoop Earrings",
        "slug": "athena-pave-huggie-hoop-earrings",
        "sku": "AURA-ER-015",
        "category_slug": "earrings",
        "short_description": "Everyday chunky micro-pavé cubic zirconia huggie hoops crafted for eternal sparkle.",
        "description": "Your new daily staple. Athena Huggies wrap snugly around the lobe with a satisfying click closure, encrusted with brilliant hand-set diamond-simulants in hypoallergenic 18K gold casing.",
        "price": 1899.0,
        "compare_at_price": 2799.0,
        "cost_price": 550.0,
        "stock_quantity": 45,
        "material": "925 Sterling Silver & AAA Zirconia",
        "plating": "18K Gold Vermeil",
        "color": "Gold",
        "dimensions": "14 mm diameter",
        "weight": "4 grams pair",
        "care_instructions": "Safe for 24/7 wear, gym, and shower.",
        "is_featured": False,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 4.8,
        "reviews_count": 67,
        "images": [
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Goddess Emerald Fan Tassel Earrings",
        "slug": "goddess-emerald-fan-tassel-earrings",
        "sku": "AURA-ER-016",
        "category_slug": "earrings",
        "short_description": "Art-deco inspired emerald green cabochons with cascading fluid gold serpent chains.",
        "description": "An opulent fusion of vintage Parisian glamour and royal Indian poise. Rich emerald crystal cabochons framed by micro-pavé accents cascade into fluid golden fringe tassels that shimmer with every gesture.",
        "price": 3499.0,
        "compare_at_price": 5299.0,
        "cost_price": 1150.0,
        "stock_quantity": 16,
        "material": "Brass, Emerald Crystal & Zirconia",
        "plating": "18K Antique Gold Plated",
        "color": "Antique Gold",
        "dimensions": "7.5 cm x 2.8 cm",
        "weight": "16 grams pair",
        "care_instructions": "Store individually to prevent tassel tangling.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 34,
        "images": [
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── NECKLACES (Already has 2, adding 4 more -> total 6) ───────────────────
    {
        "title": "Aurelia Layered Snake & Herringbone Chain",
        "slug": "aurelia-layered-snake-herringbone-chain",
        "sku": "AURA-NK-017",
        "category_slug": "necklaces",
        "short_description": "Pre-curated double layer snake and flat herringbone liquid gold chain duo.",
        "description": "Master the effortless art of jewellery layering with the Aurelia duo. Featuring a silky 3mm flat herringbone chain paired with a fluid round snake chain joined by a single seamless clasp for zero tangle styling.",
        "price": 2799.0,
        "compare_at_price": 4199.0,
        "cost_price": 850.0,
        "stock_quantity": 32,
        "material": "Stainless Steel Base",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Gold",
        "dimensions": "40 cm & 45 cm + 6 cm extender",
        "weight": "18 grams",
        "care_instructions": "Store flat to preserve the herringbone curve.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 4.9,
        "reviews_count": 81,
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
        "title": "Helios Medallion Sun Pendant Choker",
        "slug": "helios-medallion-sun-pendant-choker",
        "sku": "AURA-NK-018",
        "category_slug": "necklaces",
        "short_description": "Hand-engraved ancient sun deity coin suspended from an artisan beaded cable chain.",
        "description": "A talisman of warmth, joy, and fortune. The Helios coin necklace is struck with an artisanal matte-relief sun motif surrounded by micro-beading and dipped in 18K yellow gold.",
        "price": 2399.0,
        "compare_at_price": 3599.0,
        "cost_price": 750.0,
        "stock_quantity": 25,
        "material": "925 Sterling Silver Core",
        "plating": "18K Gold Vermeil",
        "color": "Gold",
        "dimensions": "45 cm + 5 cm extender; Coin 20 mm",
        "weight": "9.5 grams",
        "care_instructions": "Wipe with soft polishing cloth.",
        "is_featured": False,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 4.8,
        "reviews_count": 39,
        "images": [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Valkyrie Bold Statement Link Collar",
        "slug": "valkyrie-bold-statement-link-collar",
        "sku": "AURA-NK-019",
        "category_slug": "necklaces",
        "short_description": "Architectural chunky interlocking curb links for unapologetic high-fashion power dressing.",
        "description": "Bold, substantial, and undeniably luxurious. The Valkyrie Collar features hollowed lightweight statement links designed to rest seamlessly against your collarbone with zero neck fatigue.",
        "price": 3999.0,
        "compare_at_price": 5999.0,
        "cost_price": 1300.0,
        "stock_quantity": 15,
        "material": "Aircraft-grade Aluminum & Brass",
        "plating": "18K Triple Gold PVD",
        "color": "Gold",
        "dimensions": "42 cm fixed choker length",
        "weight": "38 grams",
        "care_instructions": "Store in the signature hard-shell jewelry box.",
        "is_featured": True,
        "is_trending": False,
        "is_new_arrival": False,
        "rating": 5.0,
        "reviews_count": 27,
        "images": [
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Isabella Emerald Solitaire Tennis Collar",
        "slug": "isabella-emerald-solitaire-tennis-collar",
        "sku": "AURA-NK-020",
        "category_slug": "necklaces",
        "short_description": "Continuous row of bezel-set diamond-simulants featuring an emerald cut Colombian green centerpiece.",
        "description": "An imperial homage to high jewellery. Four-millimeter brilliant cut round zirconias lead directly to a rich deep-green simulated emerald center stone wrapped in micro pavé.",
        "price": 4499.0,
        "compare_at_price": 6899.0,
        "cost_price": 1450.0,
        "stock_quantity": 14,
        "material": "925 Sterling Silver & Lab Crystals",
        "plating": "18K White Gold & Gold Dip",
        "color": "Silver",
        "dimensions": "40 cm + 5 cm extension",
        "weight": "24 grams",
        "care_instructions": "Avoid wearing during swimming or chemical exposure.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 46,
        "images": [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── RINGS (Already has 2, adding 4 more -> total 6) ───────────────────────
    {
        "title": "Astraea Eternity Baguette Stack Ring",
        "slug": "astraea-eternity-baguette-stack-ring",
        "sku": "AURA-RG-021",
        "category_slug": "rings",
        "short_description": "Clean alternating channel-set baguette and round brilliant cut diamond simulants.",
        "description": "Architectural symmetry meets classic romanticism. Modern channel setting ensures stones sit flush against neighboring rings, making Astraea the ultimate everyday luxury stacking ring.",
        "price": 1999.0,
        "compare_at_price": 2999.0,
        "cost_price": 600.0,
        "stock_quantity": 35,
        "material": "925 Sterling Silver",
        "plating": "18K Gold Vermeil",
        "color": "Gold",
        "dimensions": "Available in sizes 6, 7, 8, 9",
        "weight": "3.8 grams",
        "care_instructions": "Safe for regular hand sanitizer and hand washing.",
        "is_featured": False,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 4.9,
        "reviews_count": 53,
        "images": [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Empress Emerald Cut Cocktail Ring",
        "slug": "empress-emerald-cut-cocktail-ring",
        "sku": "AURA-RG-022",
        "category_slug": "rings",
        "short_description": "Substantial 5-carat equivalent emerald cut solitaire flanked by tapered baguette side stones.",
        "description": "Inspired by 1920s Art Deco cocktail culture, the Empress ring exhibits hypnotic step-cut facets that create a hall-of-mirrors effect. Built with an ergonomic comfort-fit curved inner shank.",
        "price": 2899.0,
        "compare_at_price": 4399.0,
        "cost_price": 850.0,
        "stock_quantity": 22,
        "material": "925 Sterling Silver & AAA Zirconia",
        "plating": "18K White Gold & Yellow Gold",
        "color": "Silver",
        "dimensions": "Available in sizes 6, 7, 8",
        "weight": "6.2 grams",
        "care_instructions": "Store in the cushioned ring slot.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 5.0,
        "reviews_count": 61,
        "images": [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Solstice Textured Dome Signet Ring",
        "slug": "solstice-textured-dome-signet-ring",
        "sku": "AURA-RG-023",
        "category_slug": "rings",
        "short_description": "Voluminous chunky golden croissant dome ring with a mirror-finish polish.",
        "description": "A Parisienne fashion editor favorite. Bold croissant-fluted ridges curve gracefully over the finger, adding instant confidence and tactile texture to any ring stack.",
        "price": 1799.0,
        "compare_at_price": 2699.0,
        "cost_price": 500.0,
        "stock_quantity": 40,
        "material": "Stainless Steel Base",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Gold",
        "dimensions": "Available in sizes 6, 7, 8, 9",
        "weight": "8 grams",
        "care_instructions": "100% waterproof and sweatproof.",
        "is_featured": False,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 4.8,
        "reviews_count": 78,
        "images": [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Baroque Pearl Molten Crown Ring",
        "slug": "baroque-pearl-molten-crown-ring",
        "sku": "AURA-RG-024",
        "category_slug": "rings",
        "short_description": "Natural irregular freshwater baroque button pearl cupped in molten gold prongs.",
        "description": "Each Baroque Crown ring is truly one-of-a-kind. Handcrafted around organic freshwater pearls, the molten gold band wraps organically around the gem like a natural gilded tide.",
        "price": 2499.0,
        "compare_at_price": 3799.0,
        "cost_price": 800.0,
        "stock_quantity": 18,
        "material": "Natural Pearl & Brass",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Pearl White",
        "dimensions": "Adjustable comfort band (Fits 6-9)",
        "weight": "5.5 grams",
        "care_instructions": "Gently wipe with dry cloth after wear.",
        "is_featured": True,
        "is_trending": False,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 31,
        "images": [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── BRACELETS (Already has 2, adding 4 more -> total 6) ───────────────────
    {
        "title": "Celestia Diamond Tennis Bracelet",
        "slug": "celestia-diamond-tennis-bracelet",
        "sku": "AURA-BR-025",
        "category_slug": "bracelets",
        "short_description": "Four-prong classic continuous diamond-simulant link bracelet with double security clasp.",
        "description": "The quintessential symbol of effortless refinement. Featuring sixty round-cut AAA cubic zirconia stones set in precision four-prong collets with a double-latch hidden safety tongue clasp.",
        "price": 3299.0,
        "compare_at_price": 4999.0,
        "cost_price": 950.0,
        "stock_quantity": 26,
        "material": "925 Sterling Silver Base",
        "plating": "18K Gold Vermeil & Rhodium",
        "color": "Gold",
        "dimensions": "17.5 cm & 19 cm lengths available",
        "weight": "12 grams",
        "care_instructions": "Store in the velvet bracelet rail box.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 5.0,
        "reviews_count": 92,
        "images": [
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Aura Sculptural Hinged Bangle Cuff",
        "slug": "aura-sculptural-hinged-bangle-cuff",
        "sku": "AURA-BR-026",
        "category_slug": "bracelets",
        "short_description": "Clean minimalist oval hinged cuff bangle with a secure push-button concealed clasp.",
        "description": "Ergonomically contoured to mirror the natural curve of the wrist. Sleek mirror-finished 18K gold casing opens smoothly with a spring-loaded push button for effortless one-handed wear.",
        "price": 2799.0,
        "compare_at_price": 4199.0,
        "cost_price": 850.0,
        "stock_quantity": 30,
        "material": "Stainless Steel Base",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Gold",
        "dimensions": "58 mm x 50 mm inner oval",
        "weight": "22 grams",
        "care_instructions": "100% waterproof and scratch resistant.",
        "is_featured": False,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 4.9,
        "reviews_count": 48,
        "images": [
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Baroque Freshwater Pearl Link Bracelet",
        "slug": "baroque-freshwater-pearl-link-bracelet",
        "sku": "AURA-BR-027",
        "category_slug": "bracelets",
        "short_description": "Alternating oversized oval paperclip links and hand-wired baroque pearls.",
        "description": "A harmonious blend of modern geometric chain structure and soft oceanic pearls. Every pearl is organically grown and finished with our bespoke engraved toggle clasp closure.",
        "price": 2899.0,
        "compare_at_price": 4299.0,
        "cost_price": 900.0,
        "stock_quantity": 21,
        "material": "Freshwater Pearls & Brass",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Pearl White",
        "dimensions": "18 cm + 3 cm extender",
        "weight": "14 grams",
        "care_instructions": "Gently polish with a clean microfibre cloth.",
        "is_featured": True,
        "is_trending": False,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 37,
        "images": [
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Serpentine Snake Herringbone Wrist Chain",
        "slug": "serpentine-snake-herringbone-wrist-chain",
        "sku": "AURA-BR-028",
        "category_slug": "bracelets",
        "short_description": "Silky 4mm liquid-gold herringbone chain that drapes effortlessly across the wrist.",
        "description": "Incredibly tactile and mesmerizingly smooth. The Serpentine wrist chain hugs the contours of the wrist like liquid gold, catching the spotlight with an unmistakable liquid gleam.",
        "price": 1999.0,
        "compare_at_price": 2899.0,
        "cost_price": 580.0,
        "stock_quantity": 38,
        "material": "Stainless Steel Base",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Gold",
        "dimensions": "16 cm + 4 cm extender",
        "weight": "8 grams",
        "care_instructions": "Store flat to maintain smooth herringbone link alignment.",
        "is_featured": False,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 4.8,
        "reviews_count": 64,
        "images": [
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── PENDANT SETS (Already has 1, adding 5 more -> total 6) ────────────────
    {
        "title": "Celeste Solitaire Diamond Pendant Set",
        "slug": "celeste-solitaire-diamond-pendant-set",
        "sku": "AURA-PD-029",
        "category_slug": "pendant-sets",
        "short_description": "Delicate floating round solitaire pendant necklace with matching classic stud earrings.",
        "description": "Effortless every-day elegance. A 1.5-carat equivalent AAA round brilliant zirconia floats along a fine box chain, paired with a matching pair of 4-prong diamond stud earrings.",
        "price": 2699.0,
        "compare_at_price": 3999.0,
        "cost_price": 800.0,
        "stock_quantity": 30,
        "material": "925 Sterling Silver Base",
        "plating": "18K Gold Vermeil",
        "color": "Gold",
        "dimensions": "Pendant 42 cm + 5 cm; Studs 6 mm",
        "weight": "8 grams set",
        "care_instructions": "Safe for daily wear and showering.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 5.0,
        "reviews_count": 72,
        "images": [
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "L’Amour Rose Quartz Heart Pendant Set",
        "slug": "lamour-rose-quartz-heart-pendant-set",
        "sku": "AURA-PD-030",
        "category_slug": "pendant-sets",
        "short_description": "Natural translucent pink Madagascar rose quartz hearts bezel-set in 18K rose gold.",
        "description": "The stone of unconditional love and harmony. Hand-carved authentic rose quartz cabochons bezel framed in polished rose gold, accompanied by delicate heart stud earrings.",
        "price": 2999.0,
        "compare_at_price": 4499.0,
        "cost_price": 950.0,
        "stock_quantity": 24,
        "material": "Natural Rose Quartz & Brass",
        "plating": "18K Rose Gold PVD Anti-Tarnish",
        "color": "Rose Gold",
        "dimensions": "Necklace 45 cm + 5 cm; Earring 8 mm",
        "weight": "11 grams set",
        "care_instructions": "Store in soft jewelry pouch away from sunlight.",
        "is_featured": True,
        "is_trending": False,
        "is_new_arrival": True,
        "rating": 4.9,
        "reviews_count": 41,
        "images": [
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Solstice Evil Eye Sapphire Pendant Set",
        "slug": "solstice-evil-eye-sapphire-pendant-set",
        "sku": "AURA-PD-031",
        "category_slug": "pendant-sets",
        "short_description": "Mother of pearl & sapphire blue crystal protective eye medallion with micro-pavé matching studs.",
        "description": "An ancient protective talisman reimagined with contemporary sophistication. Genuine mother-of-pearl inlay framed by halo zirconia and rich cobalt blue crystal pupil.",
        "price": 2899.0,
        "compare_at_price": 4299.0,
        "cost_price": 900.0,
        "stock_quantity": 25,
        "material": "Mother of Pearl & 925 Silver Core",
        "plating": "18K Gold Vermeil",
        "color": "Gold",
        "dimensions": "Medallion 16 mm; Chain 45 cm",
        "weight": "9 grams set",
        "care_instructions": "Wipe with damp cloth. Avoid harsh chemicals.",
        "is_featured": False,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 56,
        "images": [
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Opaline Aura Teardrop Pendant Set",
        "slug": "opaline-aura-teardrop-pendant-set",
        "sku": "AURA-PD-032",
        "category_slug": "pendant-sets",
        "short_description": "Shimmering rainbow Australian simulated opal teardrops framed in micro-claw gold baskets.",
        "description": "Flashes of fiery orange, electric green, and oceanic teal come alive in our simulated opal suite. Featuring an elegant teardrop necklace and matching dainty drops.",
        "price": 3199.0,
        "compare_at_price": 4799.0,
        "cost_price": 1050.0,
        "stock_quantity": 19,
        "material": "Simulated Fire Opal & Silver",
        "plating": "18K Gold Vermeil",
        "color": "Multicolour",
        "dimensions": "Pendant 18 mm; Chain 45 cm",
        "weight": "8.5 grams set",
        "care_instructions": "Store flat in velvet case.",
        "is_featured": True,
        "is_trending": False,
        "is_new_arrival": False,
        "rating": 4.9,
        "reviews_count": 33,
        "images": [
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Baroque Pearl Drop Medallion Pendant Set",
        "slug": "baroque-pearl-drop-medallion-pendant-set",
        "sku": "AURA-PD-033",
        "category_slug": "pendant-sets",
        "short_description": "Engraved golden portrait coin with floating natural baroque pearl drop and matching pearl huggies.",
        "description": "An imperial Roman profile coin pendant accented with a luminescent freshwater pearl drop, matched with pearl-drop golden huggies for a complete vintage Renaissance look.",
        "price": 3399.0,
        "compare_at_price": 4999.0,
        "cost_price": 1100.0,
        "stock_quantity": 22,
        "material": "Freshwater Pearls & Brass",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Pearl White",
        "dimensions": "Coin 22 mm; Pearl 12 mm; Chain 48 cm",
        "weight": "16 grams set",
        "care_instructions": "Store in the velvet pouch provided.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 48,
        "images": [
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── ANKLETS (Already has 1, adding 5 more -> total 6) ─────────────────────
    {
        "title": "Zephyr Triple Layer Satellite Bead Anklet",
        "slug": "zephyr-triple-layer-satellite-bead-anklet",
        "sku": "AURA-AK-034",
        "category_slug": "anklets",
        "short_description": "Cascading triple strand fine gold chain dotted with micro-satellite beads and tiny bells.",
        "description": "Catching every summer sea breeze, the Zephyr anklet combines three staggered cable chains with mirror-faceted miniature gold beads for a delicate shimmer with every step.",
        "price": 1899.0,
        "compare_at_price": 2799.0,
        "cost_price": 550.0,
        "stock_quantity": 36,
        "material": "Stainless Steel Base",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Gold",
        "dimensions": "22 cm + 5 cm extension",
        "weight": "6 grams",
        "care_instructions": "100% waterproof. Safe for ocean and shower.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 4.9,
        "reviews_count": 63,
        "images": [
            "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Santorini Turquoise Beaded Shell Anklet",
        "slug": "santorini-turquoise-beaded-shell-anklet",
        "sku": "AURA-AK-035",
        "category_slug": "anklets",
        "short_description": "Natural turquoise seed beads and 18K gold dipped cowrie shell charms.",
        "description": "Capture eternal Mediterranean vacation vibes. Natural stabilized turquoise rondelle beads interspaced with miniature gilded cowrie shells on a waterproof polymer cord.",
        "price": 1999.0,
        "compare_at_price": 2999.0,
        "cost_price": 600.0,
        "stock_quantity": 28,
        "material": "Turquoise & Brass",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Multicolour",
        "dimensions": "21 cm + 6 cm extender",
        "weight": "8.5 grams",
        "care_instructions": "Rinse with fresh water after ocean swimming.",
        "is_featured": False,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 45,
        "images": [
            "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Mayura Traditional Ghungroo Payal Anklet",
        "slug": "mayura-traditional-ghungroo-payal-anklet",
        "sku": "AURA-AK-036",
        "category_slug": "anklets",
        "short_description": "Heritage artisanal curb chain with soft-melodic ghungroo bells in antique matte gold finish.",
        "description": "Crafted for festivals, weddings, and traditional grandeur. Features delicately tuned micro-ghungroos that produce an enchanting, soothing chyme with every graceful movement.",
        "price": 2499.0,
        "compare_at_price": 3699.0,
        "cost_price": 750.0,
        "stock_quantity": 22,
        "material": "Brass Base",
        "plating": "18K Antique Gold Plated",
        "color": "Antique Gold",
        "dimensions": "24 cm + 4 cm extension",
        "weight": "19 grams",
        "care_instructions": "Avoid moisture contact; store in airtight ziplock.",
        "is_featured": True,
        "is_trending": False,
        "is_new_arrival": False,
        "rating": 4.9,
        "reviews_count": 58,
        "images": [
            "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Astraea Tennis Solitaire Crystal Anklet",
        "slug": "astraea-tennis-solitaire-crystal-anklet",
        "sku": "AURA-AK-037",
        "category_slug": "anklets",
        "short_description": "Continuous row of bezel-set diamond-simulants tailored into an ankle tennis strand.",
        "description": "Pure red-carpet glamour for your feet. Ultra-fine bezel collets prevent snagging against silk hems or dresses, radiating uninterrupted brilliance day to night.",
        "price": 2799.0,
        "compare_at_price": 4199.0,
        "cost_price": 850.0,
        "stock_quantity": 25,
        "material": "925 Sterling Silver Base",
        "plating": "18K Gold Vermeil",
        "color": "Gold",
        "dimensions": "21 cm + 4 cm extension",
        "weight": "9 grams",
        "care_instructions": "Store in flat pouch.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 39,
        "images": [
            "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Minimalist Snake Chain Shimmer Anklet",
        "slug": "minimalist-snake-chain-shimmer-anklet",
        "sku": "AURA-AK-038",
        "category_slug": "anklets",
        "short_description": "Silky 2mm round snake chain that slinks smoothly around the ankle bone.",
        "description": "Understated luxury at its pinnacle. Clean, zero-snag construction engineered from surgical-grade stainless steel with 18K real gold PVD infusion for lifetime anti-tarnish protection.",
        "price": 1699.0,
        "compare_at_price": 2499.0,
        "cost_price": 450.0,
        "stock_quantity": 50,
        "material": "Surgical Stainless Steel",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Gold",
        "dimensions": "21 cm + 5 cm extension",
        "weight": "5.5 grams",
        "care_instructions": "100% waterproof and sweatproof.",
        "is_featured": False,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 4.8,
        "reviews_count": 87,
        "images": [
            "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── JEWELLERY SETS (Already has 1, adding 5 more -> total 6) ──────────────
    {
        "title": "Padmavati Heritage Polki Choker Set",
        "slug": "padmavati-heritage-polki-choker-set",
        "sku": "AURA-ST-039",
        "category_slug": "jewellery-sets",
        "short_description": "Grand uncut polki choker with emerald droplet clusters, matching jhumkas and maang tikka.",
        "description": "An imperial bridal triumph. Intricate Meenakari enameling on the reverse side with hand-faceted uncut polki crystals on the front, suspended with Colombian emerald bead droplets.",
        "price": 8999.0,
        "compare_at_price": 13999.0,
        "cost_price": 3100.0,
        "stock_quantity": 10,
        "material": "Brass, Polki & Semi-precious Emeralds",
        "plating": "22K Antique Gold Micro-Plated",
        "color": "Antique Gold",
        "dimensions": "Choker adjustable dori; Jhumkas 7 cm",
        "weight": "120 grams set",
        "care_instructions": "Store in the velvet heirloom bridal case.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 44,
        "images": [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Celeste Baroque Pearl Ensemble Suite",
        "slug": "celeste-baroque-pearl-ensemble-suite",
        "sku": "AURA-ST-040",
        "category_slug": "jewellery-sets",
        "short_description": "Matching baroque pearl collar necklace, statement pearl drop earrings, and linked bracelet.",
        "description": "Complete oceanic majesty. Each genuine baroque pearl is uniquely contoured by nature, harmonized with 18K brushed gold molten nuggets into an unforgettable contemporary set.",
        "price": 7499.0,
        "compare_at_price": 11499.0,
        "cost_price": 2600.0,
        "stock_quantity": 12,
        "material": "Freshwater Pearls & Brass",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Pearl White",
        "dimensions": "Necklace 42 cm; Bracelet 18 cm; Earrings 5 cm",
        "weight": "65 grams complete suite",
        "care_instructions": "Store in the signature satin-lined jewellery chest.",
        "is_featured": True,
        "is_trending": False,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 38,
        "images": [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Astraea Grand Diamond Cocktail Set",
        "slug": "astraea-grand-diamond-cocktail-set",
        "sku": "AURA-ST-041",
        "category_slug": "jewellery-sets",
        "short_description": "Luxe pavé tennis necklace, matching tennis bracelet, and chandelier drop earrings.",
        "description": "The ultimate gala ensemble. Crafted with over two hundred round and marquise-cut diamond-simulants in hypoallergenic 18K white gold casing for celestial sparkle.",
        "price": 8499.0,
        "compare_at_price": 12999.0,
        "cost_price": 2900.0,
        "stock_quantity": 11,
        "material": "925 Sterling Silver & AAA Zirconia",
        "plating": "18K White Gold & Rhodium Dip",
        "color": "Silver",
        "dimensions": "Necklace 42 cm; Bracelet 18 cm; Earrings 6 cm",
        "weight": "58 grams suite",
        "care_instructions": "Keep in provided lockable travel casket.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 5.0,
        "reviews_count": 51,
        "images": [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Kundan Noor Temple Choker & Earring Suite",
        "slug": "kundan-noor-temple-choker-earring-suite",
        "sku": "AURA-ST-042",
        "category_slug": "jewellery-sets",
        "short_description": "Temple-carved Lakshmi coin medallions flanked by jadau kundan stones and ruby seed clusters.",
        "description": "An authentic revival of South Indian temple jewellery. Antique copper-gold alloy carved with sacred motifs, crowned with ruby-red cabochons and natural freshwater seed pearls.",
        "price": 6999.0,
        "compare_at_price": 9999.0,
        "cost_price": 2400.0,
        "stock_quantity": 15,
        "material": "Copper Alloy & Synthetic Ruby/Pearls",
        "plating": "22K Antique Temple Gold Finish",
        "color": "Antique Gold",
        "dimensions": "Choker width 3.5 cm; Jhumkas 6 cm",
        "weight": "85 grams",
        "care_instructions": "Store dry. Avoid perfume, water and sprays.",
        "is_featured": False,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 4.9,
        "reviews_count": 32,
        "images": [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Minimalist Soleil Everyday Trio Suite",
        "slug": "minimalist-soleil-everyday-trio-suite",
        "sku": "AURA-ST-043",
        "category_slug": "jewellery-sets",
        "short_description": "Coordinated sunburst coin pendant, matching mini-huggie earrings, and cuff bangle.",
        "description": "Designed for the modern woman on the go. Clean geometric sun-ray engraving across all three matching pieces in 100% waterproof 18K gold PVD plating.",
        "price": 5499.0,
        "compare_at_price": 7999.0,
        "cost_price": 1850.0,
        "stock_quantity": 25,
        "material": "Surgical Stainless Steel",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Gold",
        "dimensions": "Pendant 45 cm; Bangle 58 mm; Huggies 14 mm",
        "weight": "32 grams suite",
        "care_instructions": "Lifetime anti-tarnish warranty. Safe in water.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 5.0,
        "reviews_count": 68,
        "images": [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── GIFT COLLECTIONS (Already has 1, adding 5 more -> total 6) ────────────
    {
        "title": "The Empress Royal Velvet Anniversary Box",
        "slug": "the-empress-royal-velvet-anniversary-box",
        "sku": "AURA-GF-044",
        "category_slug": "gift-collections",
        "short_description": "Collector’s Edition emerald velvet box containing a solitaire pendant, pavé ring, and scented wax tablet.",
        "description": "An opulent gifting presentation for life's most cherished milestones. Encased in a custom forest-green velvet box with gold-foil seal, featuring our signature solitaire marquise ring, matching pendant, and an artisanal jasmine scented wax tablet.",
        "price": 4999.0,
        "compare_at_price": 7499.0,
        "cost_price": 1750.0,
        "stock_quantity": 20,
        "material": "925 Silver, Zirconia & Luxury Velvet Box",
        "plating": "18K Gold Vermeil",
        "color": "Gold",
        "dimensions": "Luxury Gift Chest 20 x 15 x 8 cm",
        "weight": "350 grams with box",
        "care_instructions": "Includes personalized calligraphy greeting card.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 89,
        "images": [
            "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Bridal Radiance Trousseau Treasure Box",
        "slug": "bridal-radiance-trousseau-treasure-box",
        "sku": "AURA-GF-045",
        "category_slug": "gift-collections",
        "short_description": "Exclusive trousseau collection box featuring bridal chokers, earrings, haathphool, and gold tissue pouch.",
        "description": "Curated specially for the discerning bride. Crafted with exquisite kundan, lustrous simulated pearls, and gold-embroidered satin travel pouches to house heirloom treasures.",
        "price": 9999.0,
        "compare_at_price": 14999.0,
        "cost_price": 3500.0,
        "stock_quantity": 10,
        "material": "Brass, Kundan & Satin Trunk",
        "plating": "22K Antique Gold Micro-Finish",
        "color": "Antique Gold",
        "dimensions": "Trunk 25 x 18 x 12 cm",
        "weight": "600 grams",
        "care_instructions": "Store in the climate-protected trunk.",
        "is_featured": True,
        "is_trending": False,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 47,
        "images": [
            "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Ma Cherie Rose Gold Bridesmaid Gift Hamper",
        "slug": "ma-cherie-rose-gold-bridesmaid-gift-hamper",
        "sku": "AURA-GF-046",
        "category_slug": "gift-collections",
        "short_description": "Blush pink hard-shell box with custom initial disc necklace, heart huggies, and silk scrunchie.",
        "description": "The perfect celebratory token for your bridal party. High-luster 18K rose gold necklace and huggies packaged with pure mulberry silk accessories in an embossed blush pink gift box.",
        "price": 3499.0,
        "compare_at_price": 5199.0,
        "cost_price": 1200.0,
        "stock_quantity": 30,
        "material": "Stainless Steel & Mulberry Silk",
        "plating": "18K Rose Gold PVD Anti-Tarnish",
        "color": "Rose Gold",
        "dimensions": "Gift Box 18 x 12 x 6 cm",
        "weight": "220 grams",
        "care_instructions": "Personalized monogram card included.",
        "is_featured": False,
        "is_trending": True,
        "is_new_arrival": False,
        "rating": 4.9,
        "reviews_count": 62,
        "images": [
            "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Minimalist Pearl & Chain Duo Gift Set",
        "slug": "minimalist-pearl-chain-duo-gift-set",
        "sku": "AURA-GF-047",
        "category_slug": "gift-collections",
        "short_description": "Paired freshwater baroque pearl necklace and bracelet housed in an ivory drawer jewel box.",
        "description": "Timeless, versatile, and understatedly regal. A matched pair of genuine baroque pearl chain pieces in champagne gold finish, nestled in an ivory pull-out drawer presentation box.",
        "price": 3899.0,
        "compare_at_price": 5799.0,
        "cost_price": 1350.0,
        "stock_quantity": 25,
        "material": "Freshwater Pearls & Steel",
        "plating": "18K Gold PVD Anti-Tarnish",
        "color": "Pearl White",
        "dimensions": "Drawer Box 15 x 15 x 5 cm",
        "weight": "240 grams",
        "care_instructions": "Keep in the protective drawer box.",
        "is_featured": True,
        "is_trending": True,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 55,
        "images": [
            "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Aura Heritage Festive Velvet Shringaar Hamper",
        "slug": "aura-heritage-festive-velvet-shringaar-hamper",
        "sku": "AURA-GF-048",
        "category_slug": "gift-collections",
        "short_description": "Festive Diwali / Eid collector's hamper with antique polki earrings, cuff, and brass incense vessel.",
        "description": "Crafted to celebrate India's vibrant festive seasons. Features an authentic antique polki jhumka, adjustable cuff, handmade brass dhoop cone burner, and organic saffron tea.",
        "price": 5999.0,
        "compare_at_price": 8999.0,
        "cost_price": 2100.0,
        "stock_quantity": 18,
        "material": "Brass, Polki & Pure Brass Vessel",
        "plating": "22K Antique Gold Polish",
        "color": "Antique Gold",
        "dimensions": "Festive Hamper 28 x 20 x 10 cm",
        "weight": "750 grams",
        "care_instructions": "Store in the ceremonial hamper box.",
        "is_featured": True,
        "is_trending": False,
        "is_new_arrival": True,
        "rating": 5.0,
        "reviews_count": 42,
        "images": [
            "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        ]
    }
]

# Standard variants generator with comprehensive luxury colors
STANDARD_VARIANTS = [
    ("Gold", "Standard", 0.0),
    ("Rose Gold", "Standard", 0.0),
    ("Silver", "Standard", 0.0),
    ("Antique Gold", "Standard", 100.0),
    ("Pearl White", "Standard", 150.0),
    ("Black", "Standard", 0.0),
    ("Multicolour", "Standard", 200.0)
]

now_str = get_utc_now()
inserted_count = 0

for p in NEW_PRODUCTS:
    slug = p["slug"]
    # Check if product already exists
    c.execute('SELECT id FROM products WHERE slug = ?', (slug,))
    existing = c.fetchone()
    if existing:
        prod_id = existing[0]
    else:
        prod_id = generate_uuid()
        cat_id = cats.get(p["category_slug"])
        c.execute('''
            INSERT INTO products (
                id, title, slug, sku, category_id, short_description, description,
                price, compare_at_price, cost_price, stock_quantity,
                material, plating, color, dimensions, weight, care_instructions,
                is_featured, is_trending, is_new_arrival, is_active,
                rating, reviews_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
        ''', (
            prod_id, p["title"], p["slug"], p["sku"], cat_id, p["short_description"], p["description"],
            p["price"], p["compare_at_price"], p["cost_price"], p["stock_quantity"],
            p["material"], p["plating"], p["color"], p["dimensions"], p["weight"], p["care_instructions"],
            1 if p["is_featured"] else 0, 1 if p["is_trending"] else 0, 1 if p["is_new_arrival"] else 0,
            p["rating"], p["reviews_count"], now_str, now_str
        ))
        inserted_count += 1

    # Insert 5-6 Product Images if not already present
    c.execute('SELECT COUNT(*) FROM product_images WHERE product_id = ?', (prod_id,))
    if c.fetchone()[0] == 0:
        for idx, img_url in enumerate(p["images"]):
            img_id = generate_uuid()
            c.execute('''
                INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_primary)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (img_id, prod_id, img_url, f"{p['title']} angle {idx + 1}", idx, 1 if idx == 0 else 0))

    # Insert Variants with rich colors
    c.execute('SELECT COUNT(*) FROM product_variants WHERE product_id = ?', (prod_id,))
    if c.fetchone()[0] == 0:
        for v_color, v_size, price_adj in STANDARD_VARIANTS:
            v_id = generate_uuid()
            v_title = f"{v_color} Finish / {v_size}"
            v_price = p["price"] + price_adj
            v_stock = p["stock_quantity"] // len(STANDARD_VARIANTS) + 4
            c.execute('''
                INSERT INTO product_variants (id, product_id, title, sku, color, size, price, stock_quantity, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            ''', (v_id, prod_id, v_title, f"{p['sku']}-{v_color[:3].upper()}", v_color, v_size, v_price, v_stock))

conn.commit()

# Also update existing 12 products so they have the 6 standard colour variants if missing!
c.execute('SELECT id, sku, price, stock_quantity FROM products')
all_products = c.fetchall()
for prod_id, p_sku, p_price, p_stock in all_products:
    c.execute('SELECT color FROM product_variants WHERE product_id = ?', (prod_id,))
    existing_colors = {row[0] for row in c.fetchall()}
    for v_color, v_size, price_adj in STANDARD_VARIANTS:
        if v_color not in existing_colors and v_color != "Gold" and v_color != "Champagne Gold":
            v_id = generate_uuid()
            v_title = f"{v_color} / {v_size}"
            v_price = (p_price or 2500.0) + price_adj
            v_stock = 15
            c.execute('''
                INSERT INTO product_variants (id, product_id, title, sku, color, size, price, stock_quantity, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            ''', (v_id, prod_id, v_title, f"{p_sku or 'AURA'}-{v_color[:3].upper()}", v_color, v_size, v_price, v_stock))

conn.commit()

# Print summary
c.execute('SELECT c.name, COUNT(p.id) FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id')
print("--- SUMMARY AFTER EXPANSION ---")
for cat_name, count in c.fetchall():
    print(f"Category '{cat_name}': {count} products")

c.execute('SELECT COUNT(*) FROM products')
print(f"Total Products: {c.fetchone()[0]}")
c.execute('SELECT COUNT(*) FROM product_images')
print(f"Total Images: {c.fetchone()[0]}")
c.execute('SELECT COUNT(*) FROM product_variants')
print(f"Total Variants: {c.fetchone()[0]}")

conn.close()

