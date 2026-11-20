-- ============================================================================
-- AURA ATELIER - SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admin has full access to profiles" ON public.profiles FOR ALL USING (is_admin());

-- 2. CATEGORIES POLICIES
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (is_admin());

-- 3. PRODUCTS & MEDIA POLICIES
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admin can manage products" ON public.products FOR ALL USING (is_admin());

CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "Admin can manage product images" ON public.product_images FOR ALL USING (is_admin());

CREATE POLICY "Public can view product variants" ON public.product_variants FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admin can manage product variants" ON public.product_variants FOR ALL USING (is_admin());

-- 4. CARTS POLICIES
CREATE POLICY "Users can manage own cart" ON public.carts FOR ALL USING (auth.uid() = user_id OR session_id IS NOT NULL);
CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.carts
        WHERE public.carts.id = public.cart_items.cart_id
        AND (public.carts.user_id = auth.uid() OR public.carts.session_id IS NOT NULL)
    )
);

-- 5. WISHLISTS POLICIES
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = public.wishlists.user_id AND public.profiles.user_id = auth.uid()
    ) OR is_admin()
);

-- 6. ADDRESSES POLICIES
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = public.addresses.user_id AND public.profiles.user_id = auth.uid()
    ) OR is_admin()
);

-- 7. ORDERS & ITEMS POLICIES
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = public.orders.user_id AND public.profiles.user_id = auth.uid()
    ) OR is_admin()
);
CREATE POLICY "Public/Users can create orders" ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin can update orders" ON public.orders FOR UPDATE USING (is_admin());

CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders
        JOIN public.profiles ON public.profiles.id = public.orders.user_id
        WHERE public.orders.id = public.order_items.order_id AND public.profiles.user_id = auth.uid()
    ) OR is_admin()
);
CREATE POLICY "Order items insert during checkout" ON public.order_items FOR INSERT WITH CHECK (TRUE);

-- 8. REVIEWS POLICIES
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved' OR is_admin());
CREATE POLICY "Authenticated users can submit review" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can moderate reviews" ON public.reviews FOR ALL USING (is_admin());

-- 9. COUPONS POLICIES
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admin can manage coupons" ON public.coupons FOR ALL USING (is_admin());

-- 10. BANNERS POLICIES
CREATE POLICY "Public can view active banners" ON public.banners FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admin can manage banners" ON public.banners FOR ALL USING (is_admin());

