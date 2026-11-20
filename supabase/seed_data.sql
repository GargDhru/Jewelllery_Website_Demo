-- ============================================================================
-- AURA ATELIER - INITIAL SEED DATA FOR SUPABASE POSTGRESQL
-- Complete categories, products (with 5-6 images each and 4 color/paint finishes),
-- coupons, banners, and sample verified customer reviews.
-- ============================================================================

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, description, image_url, banner_url, display_order, is_active)
VALUES
('c0000000-0000-0000-0000-000000000001', 'Earrings', 'earrings', 'From radiant chandelier drops to everyday anti-tarnish Huggies and studs handcrafted in 18K gold finish.', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1600&q=80', 1, TRUE),
('c0000000-0000-0000-0000-000000000002', 'Necklaces', 'necklaces', 'Statement collar pieces, layered gold chains, and regal Kundan chokers created for modern royalty.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80', 2, TRUE),
('c0000000-0000-0000-0000-000000000003', 'Rings', 'rings', 'Stackable bands, solitaire zirconia rings, and bespoke cocktail statement rings that command attention.', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=80', 3, TRUE),
('c0000000-0000-0000-0000-000000000004', 'Bracelets', 'bracelets', 'Artisan cuffs, tennis bracelets, charm links, and delicate wrist adornments with everlasting shimmer.', 'https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=1600&q=80', 4, TRUE),
('c0000000-0000-0000-0000-000000000005', 'Pendant Sets', 'pendant-sets', 'Harmonious combinations of delicate pendant chains and matching stud earrings for effortless grace.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80', 5, TRUE),
('c0000000-0000-0000-0000-000000000006', 'Anklets', 'anklets', 'Graceful ghungroo bells, minimalistic curb chains, and pearl-lined payals for contemporary footsteps.', 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1600&q=80', 6, TRUE),
('c0000000-0000-0000-0000-000000000007', 'Jewellery Sets', 'jewellery-sets', 'Full heirloom ensembles featuring matching necklace, earrings, maang tikka, and bracelet.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80', 7, TRUE),
('c0000000-0000-0000-0000-000000000008', 'Gift Collections', 'gift-collections', 'Elegantly boxed signature gift hampers, customized anniversary editions, and festive treasures.', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80', 8, TRUE),
('c0000000-0000-0000-0000-000000000009', 'New Arrivals', 'new-arrivals', 'Our latest seasonal drops straight from the atelier workshops, reflecting world-class trends.', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1600&q=80', 9, TRUE),
('c0000000-0000-0000-0000-000000000010', 'Best Sellers', 'best-sellers', 'Celebrated creations beloved by over 25,000 discerning patrons across the globe.', 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1600&q=80', 10, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_purchase, max_discount, is_active)
VALUES
('AURA10', '10% discount on all orders above ₹1,999', 'percentage', 10.0, 1999.0, 1000.0, TRUE),
('WELCOME10', 'Special 10% welcome gift for first-time shoppers', 'percentage', 10.0, 999.0, 500.0, TRUE),
('FESTIVE20', 'Festive indulgence! 20% off on orders above ₹4,999', 'percentage', 20.0, 4999.0, 2500.0, TRUE),
('FREESHIP', 'Free premium insured express delivery', 'flat', 149.0, 500.0, NULL, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Banners
INSERT INTO public.banners (title, subtitle, image_url, cta_text, cta_link, display_order, is_active)
VALUES
('The Art of Modern Handcrafted Adornment', 'Exquisite 18K Gold Plated & Anti-Tarnish Demi-Fine Jewellery Crafted for Contemporary Queens.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1800&q=80', 'Explore Collection', '/shop', 1, TRUE),
('Elegance in Every Detail', 'Resin, Baroque Pearls & Gold Leaf Atelier Creations.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=80', 'Shop Best Sellers', '/shop?sort=bestselling', 2, TRUE);

-- 4. Insert Products with 5-6 Product Images each & 4 Color/Paint Variants
-- Product 1: Earrings
INSERT INTO public.products (id, title, slug, sku, category_id, short_description, description, price, compare_at_price, cost_price, stock_quantity, material, plating, color, is_featured, is_trending, is_new_arrival, is_active, rating, reviews_count)
VALUES
('p0000000-0000-0000-0000-000000000001', 'Aura Soleil Chandelier Earrings', 'aura-soleil-chandelier-earrings', 'AURA-ER-001', 'c0000000-0000-0000-0000-000000000001', 'Handcrafted cascading chandelier drops with cubic zirconia and 18K champagne gold PVD plating.', 'Inspired by Mediterranean sunsets, the Aura Soleil Chandelier Earrings reflect dazzling brilliance with every subtle movement. Crafted in anti-tarnish stainless steel dipped in 18K champagne gold, adorned with master-cut AAA zirconia stones. Waterproof, hypoallergenic, and lightweight for whole-day wear.', 2899.00, 4499.00, 950.00, 24, 'Stainless Steel & AAA Grade Zirconia', '18K Gold PVD Anti-Tarnish', 'Champagne Gold', TRUE, TRUE, TRUE, TRUE, 4.9, 38)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80', 'Aura Soleil Chandelier Front View', 0, TRUE),
('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', 'Aura Soleil Chandelier Side Profile', 1, FALSE),
('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80', 'Aura Soleil Model Earring Styling', 2, FALSE),
('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80', 'Aura Soleil Handcrafted Detailing', 3, FALSE),
('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', 'Aura Soleil Presentation Packaging', 4, FALSE),
('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', 'Aura Soleil Atelier Macro Sparkle', 5, FALSE);

INSERT INTO public.product_variants (product_id, title, color, size, price, stock_quantity, is_active) VALUES
('p0000000-0000-0000-0000-000000000001', 'Champagne Gold / Standard', 'Champagne Gold', 'Standard', 2899.00, 24, TRUE),
('p0000000-0000-0000-0000-000000000001', 'Rose Gold / Standard', 'Rose Gold', 'Standard', 2899.00, 24, TRUE),
('p0000000-0000-0000-0000-000000000001', 'Platinum Silver / Standard', 'Platinum Silver', 'Standard', 2899.00, 24, TRUE),
('p0000000-0000-0000-0000-000000000001', 'Emerald Paint Finish / Standard', 'Emerald Green Paint', 'Standard', 2899.00, 24, TRUE);

-- Product 2: Necklaces
INSERT INTO public.products (id, title, slug, sku, category_id, short_description, description, price, compare_at_price, cost_price, stock_quantity, material, plating, color, is_featured, is_trending, is_new_arrival, is_active, rating, reviews_count)
VALUES
('p0000000-0000-0000-0000-000000000002', 'Celeste Baroque Pearl Choker Necklace', 'celeste-baroque-pearl-choker-necklace', 'AURA-NK-002', 'c0000000-0000-0000-0000-000000000002', 'Irregular organic freshwater pearls framed by 18K gold hammered sculptural beads.', 'The Celeste Choker reinterprets traditional pearls into high-fashion architectural sculpture. Each natural freshwater baroque pearl is hand-selected for unique luster and paired with 18K gold-plated molten brass beads. Finished with an adjustable signature Aura lobster clasp.', 3799.00, 5999.00, 1200.00, 18, 'Freshwater Pearls & Brass', '18K Gold PVD Anti-Tarnish', 'Ivory & Champagne Gold', TRUE, TRUE, FALSE, TRUE, 5.0, 52)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
('p0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', 'Celeste Choker Front View', 0, TRUE),
('p0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', 'Celeste Choker Neckline Draping', 1, FALSE),
('p0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', 'Celeste Choker Pearl Luster', 2, FALSE),
('p0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80', 'Celeste Choker Gold Accent Beads', 3, FALSE),
('p0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=800&q=80', 'Celeste Choker Packaging Box', 4, FALSE),
('p0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80', 'Celeste Choker Clasp and Extender', 5, FALSE);

INSERT INTO public.product_variants (product_id, title, color, size, price, stock_quantity, is_active) VALUES
('p0000000-0000-0000-0000-000000000002', 'Champagne Gold / Standard', 'Champagne Gold', 'Standard', 3799.00, 18, TRUE),
('p0000000-0000-0000-0000-000000000002', 'Rose Gold / Standard', 'Rose Gold', 'Standard', 3799.00, 18, TRUE),
('p0000000-0000-0000-0000-000000000002', 'Platinum Silver / Standard', 'Platinum Silver', 'Standard', 3799.00, 18, TRUE),
('p0000000-0000-0000-0000-000000000002', 'Emerald Paint Finish / Standard', 'Emerald Green Paint', 'Standard', 3799.00, 18, TRUE);
