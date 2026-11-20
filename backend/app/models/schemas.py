from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# ----------------- User & Auth Schemas -----------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = False

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: Optional[str] = "valid_reset_token"
    new_password: str = Field(..., min_length=8)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- Address Schemas -----------------
class AddressCreate(BaseModel):
    full_name: str
    phone: str
    street_address: str
    apartment: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str = "India"
    address_type: str = "Home"
    is_default: bool = False

class AddressResponse(AddressCreate):
    id: str
    user_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- Category Schemas -----------------
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    banner_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    banner_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- Product Schemas -----------------
class ProductImageSchema(BaseModel):
    id: Optional[str] = None
    image_url: str
    alt_text: Optional[str] = None
    display_order: int = 0
    is_primary: bool = False

    class Config:
        from_attributes = True

class ProductVariantSchema(BaseModel):
    id: Optional[str] = None
    title: str
    sku: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: int = 0
    is_active: bool = True

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    title: str
    slug: str
    sku: str
    category_id: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: float
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = None
    stock_quantity: int = 0
    material: str = "Brass & 18K Gold Plated"
    plating: str = "18K Gold PVD Anti-Tarnish"
    color: str = "Champagne Gold"
    dimensions: Optional[str] = None
    weight: Optional[str] = None
    care_instructions: Optional[str] = None
    is_featured: bool = False
    is_trending: bool = False
    is_new_arrival: bool = False
    is_active: bool = True

class ProductCreate(ProductBase):
    images: List[str] = []
    variants: List[ProductVariantSchema] = []

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    sku: Optional[str] = None
    category_id: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    material: Optional[str] = None
    plating: Optional[str] = None
    color: Optional[str] = None
    dimensions: Optional[str] = None
    weight: Optional[str] = None
    care_instructions: Optional[str] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    is_active: Optional[bool] = None
    images: Optional[List[str]] = None

class ProductResponse(ProductBase):
    id: str
    rating: float = 5.0
    reviews_count: int = 0
    created_at: Optional[datetime] = None
    category: Optional[CategoryResponse] = None
    images: List[ProductImageSchema] = []
    variants: List[ProductVariantSchema] = []

    class Config:
        from_attributes = True

# ----------------- Cart Schemas -----------------
class CartItemAdd(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    variant_id: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float
    product: ProductResponse
    variant: Optional[ProductVariantSchema] = None

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: str
    items: List[CartItemResponse] = []
    subtotal: float = 0.0
    items_count: int = 0

# ----------------- Coupon Schemas -----------------
class CouponBase(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str = "percentage"  # percentage, flat
    discount_value: float
    min_purchase: float = 0.0
    max_discount: Optional[float] = None
    valid_until: Optional[datetime] = None
    usage_limit: Optional[int] = None
    is_active: bool = True

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: str
    usage_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CouponApplyRequest(BaseModel):
    code: str
    subtotal: float

class CouponApplyResponse(BaseModel):
    valid: bool
    code: str
    discount_amount: float
    discount_type: str
    discount_value: float
    message: str

# ----------------- Order & Checkout Schemas -----------------
class CheckoutItem(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    quantity: int
    unit_price: float

class CheckoutRequest(BaseModel):
    customer_email: EmailStr
    customer_phone: str
    shipping_address: Dict[str, Any]
    billing_address: Optional[Dict[str, Any]] = None
    items: List[CheckoutItem]
    coupon_code: Optional[str] = None
    payment_method: str = "razorpay"  # razorpay, cod
    shipping_method: str = "standard"  # standard, express
    notes: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: str
    product_id: Optional[str] = None
    variant_id: Optional[str] = None
    product_title: str
    variant_title: Optional[str] = None
    sku: Optional[str] = None
    unit_price: float
    quantity: int
    total_price: float
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    order_number: str
    user_id: Optional[str] = None
    customer_email: str
    customer_phone: str
    shipping_address: Dict[str, Any]
    billing_address: Optional[Dict[str, Any]] = None
    subtotal: float
    discount_amount: float
    coupon_code: Optional[str] = None
    shipping_fee: float
    tax_amount: float
    total_amount: float
    order_status: str
    payment_status: str
    payment_method: str
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    notes: Optional[str] = None
    cancelled_reason: Optional[str] = None
    created_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []
    razorpay_order_id: Optional[str] = None

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    cancelled_reason: Optional[str] = None

# ----------------- Payment Schemas -----------------
class RazorpayCreateOrderRequest(BaseModel):
    order_id: str

class RazorpayVerifyRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class PaymentResponse(BaseModel):
    success: bool
    message: str
    order_id: str
    payment_status: str

# ----------------- Review Schemas -----------------
class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: str
    customer_name: Optional[str] = None

class ReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: Optional[str] = None
    customer_name: str
    rating: int
    title: Optional[str] = None
    comment: str
    verified_purchase: bool
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- Banner Schemas -----------------
class BannerBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    image_url: str
    cta_text: str = "Explore Now"
    cta_link: str = "/shop"
    is_active: bool = True
    display_order: int = 0

class BannerCreate(BannerBase):
    pass

class BannerResponse(BannerBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- Admin Analytics Schemas -----------------
class AdminStatsResponse(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    total_products: int = 0
    delivered_orders: int = 0
    average_order_value: float
    pending_orders: int
    low_stock_products: int
    recent_orders: List[OrderResponse] = []
    top_selling_products: List[Dict[str, Any]] = []
    sales_chart: List[Dict[str, Any]] = []

