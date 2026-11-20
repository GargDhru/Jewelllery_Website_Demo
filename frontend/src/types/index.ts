export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  banner_url?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ProductImage {
  id?: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id?: string;
  title: string;
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  category_id?: string;
  category?: Category;
  short_description?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  stock_quantity: number;
  material: string;
  plating: string;
  color: string;
  dimensions?: string;
  weight?: string;
  care_instructions?: string;
  is_featured: boolean;
  is_trending: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  rating: number;
  reviews_count: number;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: Product;
  variant?: ProductVariant;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  items_count: number;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'customer' | 'admin';
  avatar_url?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
}

export interface Address {
  id?: string;
  user_id?: string;
  full_name: string;
  phone: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: 'Home' | 'Work' | 'Other';
  is_default: boolean;
}

export interface OrderItem {
  id: string;
  product_id?: string;
  variant_id?: string;
  product_title: string;
  variant_title?: string;
  sku?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address;
  billing_address?: Address;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'razorpay' | 'cod';
  tracking_number?: string;
  courier_name?: string;
  notes?: string;
  cancelled_reason?: string;
  created_at: string;
  items: OrderItem[];
  razorpay_order_id?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_purchase: number;
  max_discount?: number;
  valid_until?: string;
  is_active: boolean;
  usage_count: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
  display_order: number;
}

export interface AdminStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  average_order_value: number;
  pending_orders: number;
  low_stock_products: number;
  recent_orders: Order[];
  top_selling_products: Array<{
    id: string;
    title: string;
    sku: string;
    price: number;
    stock_quantity: number;
    sales_count: number;
    image_url: string;
  }>;
  sales_chart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

