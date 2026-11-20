from datetime import datetime, timezone
import uuid
from typing import List, Optional
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    phone = Column(String(30), nullable=True)
    role = Column(String(20), default="customer")  # customer, admin
    avatar_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    wishlists = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Address(Base):
    __tablename__ = "addresses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=False)
    street_address = Column(Text, nullable=False)
    apartment = Column(Text, nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), default="India")
    address_type = Column(String(20), default="Home")  # Home, Work, Other
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship("User", back_populates="addresses")

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(120), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    banner_url = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    slug = Column(String(280), unique=True, index=True, nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)
    cost_price = Column(Float, nullable=True)
    stock_quantity = Column(Integer, default=0)
    material = Column(String(100), default="Brass & 18K Gold Plated")
    plating = Column(String(100), default="18K Gold PVD Anti-Tarnish")
    color = Column(String(100), default="Champagne Gold")
    dimensions = Column(String(100), nullable=True)
    weight = Column(String(50), nullable=True)
    care_instructions = Column(Text, nullable=True)
    is_featured = Column(Boolean, default=False)
    is_trending = Column(Boolean, default=False)
    is_new_arrival = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    rating = Column(Float, default=5.0)
    reviews_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.display_order")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(Text, nullable=False)
    alt_text = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)

    product = relationship("Product", back_populates="images")

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False)
    sku = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    size = Column(String(50), nullable=True)
    price = Column(Float, nullable=True)
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)

    product = relationship("Product", back_populates="variants")

class Cart(Base):
    __tablename__ = "carts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    session_id = Column(String(255), nullable=True, index=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cart_id = Column(String(36), ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    variant_id = Column(String(36), ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")

class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship("User", back_populates="wishlists")
    product = relationship("Product")

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    discount_type = Column(String(20), default="percentage")  # percentage, flat
    discount_value = Column(Float, nullable=False)
    min_purchase = Column(Float, default=0)
    max_discount = Column(Float, nullable=True)
    valid_from = Column(DateTime, default=get_utc_now)
    valid_until = Column(DateTime, nullable=True)
    usage_limit = Column(Integer, nullable=True)
    usage_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_number = Column(String(60), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(30), nullable=False)
    shipping_address = Column(JSON, nullable=False)
    billing_address = Column(JSON, nullable=True)
    subtotal = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    coupon_code = Column(String(50), nullable=True)
    shipping_fee = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    order_status = Column(String(30), default="pending")  # pending, confirmed, processing, shipped, delivered, cancelled
    payment_status = Column(String(30), default="pending")  # pending, paid, failed, refunded
    payment_method = Column(String(30), default="razorpay")  # razorpay, cod
    tracking_number = Column(String(100), nullable=True)
    courier_name = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    cancelled_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    variant_id = Column(String(36), nullable=True)
    product_title = Column(String(255), nullable=False)
    variant_title = Column(String(100), nullable=True)
    sku = Column(String(100), nullable=True)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    image_url = Column(Text, nullable=True)

    order = relationship("Order", back_populates="items")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="pending")  # pending, successful, failed, refunded
    payment_method = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    order = relationship("Order", back_populates="payments")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    customer_name = Column(String(150), nullable=False)
    rating = Column(Integer, nullable=False)
    title = Column(String(200), nullable=True)
    comment = Column(Text, nullable=False)
    verified_purchase = Column(Boolean, default=True)
    status = Column(String(20), default="approved")  # pending, approved, rejected
    created_at = Column(DateTime, default=get_utc_now)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

class Return(Base):
    __tablename__ = "returns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    order_item_id = Column(String(36), nullable=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(String(30), default="requested")  # requested, approved, rejected, refunded
    refund_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    type = Column(String(50), default="order_update")
    link = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship("User", back_populates="notifications")

class Banner(Base):
    __tablename__ = "banners"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    subtitle = Column(Text, nullable=True)
    image_url = Column(Text, nullable=False)
    cta_text = Column(String(100), default="Explore Collection")
    cta_link = Column(String(255), default="/shop")
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=get_utc_now)

