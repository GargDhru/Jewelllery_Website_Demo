# AURA ATELIER | Luxury Jewellery E-Commerce Platform

A production-grade, full-stack luxury jewellery shopping platform inspired by the elegant, handcrafted luxury aesthetic of [resionaura.vercel.app](https://resionaura.vercel.app).

---

## 1. Brand Identity & Design Direction

- **Palette**: Cream (`#FAF8F5`, `#FAF6EE`), Ivory (`#FFFFF4`), Champagne Gold (`#D4AF37`, `#C5A059`), Soft Beige (`#EFE9E1`), Muted Rose (`#D9A5A0`), and Rich Onyx (`#1A1715`).
- **Typography**: Cormorant Garamond, Cinzel, and Plus Jakarta Sans.
- **Product Craftsmanship**: 18K Gold PVD Anti-Tarnish, 1-Year Color Warranty, Real Freshwater Baroque Pearls, Crystalline Optical Resin with 24K Gold Leaf flakes.
- **Micro-Interactions**: Smooth hover effects, secondary image reveals, interactive lens zoom, slide-out bag drawer, and confetti celebrations.

---

## 2. Technology Stack

### Frontend:
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Client State & Routing**: React Router v6, TanStack Query, Context API (Auth, Cart, Wishlist, Currency, Toast)
- **Payments**: Razorpay Checkout SDK (Test Mode) + Cash on Delivery
- **Celebration Effects**: Canvas Confetti

### Backend:
- **Framework**: Python 3.10+ / FastAPI
- **Validation**: Pydantic v2
- **ORM & DB**: SQLAlchemy 2.0 (Async) + aiosqlite (zero-friction out-of-the-box local operation) or Supabase PostgreSQL (`asyncpg`)
- **Security**: JWT (`pyjwt`), Passlib / bcrypt password hashing
- **Payments**: Razorpay Python SDK with HMAC-SHA256 signature verification

### Database & Storage:
- **Supabase PostgreSQL**: Full migrations, 18 relational tables, and Row Level Security (RLS) policies in `supabase/`.
- **Local Fallback**: SQLite async engine with automatic schema creation and realistic luxury data seeding.

---

## 3. Jewellery Categories

All 10 requested categories have dedicated pages, banners, filters, and products:
1. **Earrings** (`/category/earrings`)
2. **Necklaces** (`/category/necklaces`)
3. **Rings** (`/category/rings`)
4. **Bracelets** (`/category/bracelets`)
5. **Pendant Sets** (`/category/pendant-sets`)
6. **Anklets** (`/category/anklets`)
7. **Jewellery Sets** (`/category/jewellery-sets`)
8. **Gift Collections** (`/category/gift-collections`)
9. **New Arrivals** (`/shop?new=true` & `/category/new-arrivals`)
10. **Best Sellers** (`/shop?sort=bestselling` & `/category/best-sellers`)

---

## 4. Key Platform Features

### Customer-Facing Store:
- **Announcement Bar**: Rotating promotional ticker with discounts and free shipping updates.
- **Dedicated Admin Login (`/admin/login`)**: Separate dark onyx luxury login URL strictly guarding administrator routes.
- **Customer Registration**: Enforces 3 mandatory fields (Full Name, Email, Password), strong password criteria, password visibility toggles, and confirm password matching.
- **Customer Login**: Includes show/hide password, Remember Me, and Forgot Password email reset.
- **Patron Sanctuary (`/account`)**:
  - Orders & live tracking with receipt viewer and customer cancellation.
  - Return & cancellation request modal with status tracking (`requested`, `approved`, `refunded`).
  - In-account password change with current password validation.
  - Saved wishlist with instant move-to-bag.
  - Saved delivery address book with Home/Work/Other tags.
- **Product Details (`/product/:slug`)**:
  - 5–6 images per piece with interactive magnifier zoom lens.
  - 4 metal & paint finishes (Champagne Gold, Rose Gold, Platinum Silver, Emerald Green Paint).
  - Atelier Size & Measurement Guide Modal (Rings, Necklaces, Bracelets).
  - Recently Viewed carousel based on browsing history.
  - Verified reviews feed and review submission.
- **Slide-out Cart & Checkout**:
  - Cart drawer with gift wrapping, coupon code validation (`AURA10`, `WELCOME10`, `FESTIVE20`, `FREESHIP`), and free shipping thresholds.
  - Cash on Delivery (COD) and Razorpay test mode with server-side HMAC-SHA256 signature verification.

### Admin Dashboard (`/admin` and `/admin/dashboard`):
- **Overview Metrics**: Total revenue, orders, customers, products, pending/delivered orders, low stock notifications, and sales chart.
- **Product Management**: Full CRUD, image uploads, prices, stock counts, variant finishes, and Best Seller / New Arrival flags.
- **Order Fulfillment**: Workflow management (`pending` → `confirmed` → `processing` → `shipped` → `delivered`), tracking number input, and return approvals.
- **Customer Management**: Customer search across names, emails, and phone numbers with account Activate / Deactivate toggles.
- **Coupons, Reviews & Banners**: Coupon engine CRUD, customer review moderation, and homepage banner controls.
- **Interactive Header**: Logo crest, currency switcher (INR ₹ / USD $), categories dropdown menu, live search overlay, wishlist counter, sliding cart drawer counter, patron avatar menu.
- **Home Page**:
  - Hero banner carousel with CTA buttons.
  - Value pillars (18K Gold PVD, Anti-Tarnish, 1-Year Warranty, Insured Express Delivery).
  - Shop by Category visual circles with hover animations.
  - Best Sellers tabbed filtering grid (All, Earrings, Necklaces, Rings, Bracelets).
  - Featured Editorial Lookbooks ("The Royal Heritage Ensemble", "Baroque Pearl Atelier", "Daily Anti-Tarnish Vault").
  - Atelier Craftsmanship brand story with metrics.
  - Voices of Patronage customer testimonials carousel.
  - `@aura.atelier` Instagram-style live lookbook gallery.
  - Newsletter subscription with instant `WELCOME10` voucher coupon popup.
- **Shop & Catalog (`/shop`)**:
  - Live search input.
  - Multi-faceted filter sidebar (Category, Price Range slider, Color/Plating pills, Craft material, In-stock only).
  - Sorting: Featured, Best Sellers, Newest Arrivals, Price: Low to High, Price: High to Low, Highest Rated.
  - View toggles: 4 Columns, 3 Columns, and List View.
- **Product Details (`/product/:slug`)**:
  - Multi-image gallery with hover lens zoom.
  - Price, compare MRP, stock countdown indicator ("Only X left!").
  - Color / Size variant selector.
  - Quantity selector, Add to Bag, Instant 1-Click Buy Now.
  - Postal pincode delivery date checker.
  - Tabs: Description & Story, Specifications, Anti-Tarnish & Care, 1-Year Warranty & Shipping, Client Reviews.
  - Write a customer review form with star ratings.
  - Related items ("You May Also Adore") & Social share buttons (WhatsApp, Copy Link).
- **Shopping Bag (`/cart` & Slide-Out Cart Drawer)**:
  - Add / remove / update quantities.
  - Free shipping progress bar (Free above ₹1,999).
  - Gift wrap option (+₹99) with personalized handwritten gift message.
  - Promo coupon redemption with real-time discount calculation (`AURA10`, `WELCOME10`, `FESTIVE20`, `FREESHIP`).
- **Checkout (`/checkout`)**:
  - Recipient contact and shipping address (with saved address selector for logged-in patrons).
  - Shipping speed options: Standard Insured Delivery vs VIP 24-48hr Air Express.
  - Payment options:
    - **Razorpay Secure** test mode with modal and backend HMAC-SHA256 signature verification.
    - **Cash on Delivery (COD)** with immediate order confirmation.
  - Server-side inventory decrements and order total calculations (never trusting frontend totals).
- **Order Confirmation (`/order-confirmation/:orderId`)**:
  - Confetti celebration animation.
  - Unique Order Reference (`AURA-YYMMDD-XXXXX`).
  - Fulfillment timeline stepper (Confirmed → Processing → Shipped → Delivered).
  - Printable invoice receipt.
- **Patron Sanctuary / Account (`/account`)**:
  - Order history with live tracking numbers and courier partner.
  - Cancel eligible orders action (with automatic stock restock).
  - Saved delivery addresses management (Add, delete, default switch).
  - Saved wishlist grid with quick "Move to Bag" buttons.
  - Profile and contact details management.
- **Additional Enhancements**:
  - Floating WhatsApp concierge support button.
  - Mobile bottom navigation bar.
  - 1-Click Demo Login fill buttons on Sign In page.

### Admin Dashboard (`/admin`):
- Role-based route guard (accessible only to `role === 'admin'`).
- **Analytics KPI Cards**: Total Revenue, Total Orders, Total Patrons, Average Order Value (AOV), Pending Orders, Low Stock Alert.
- **Sales Revenue Chart**: Interactive daily revenue bar chart.
- **Product Catalog Management**: Create, edit, and delete pieces, upload multiple image URLs, manage prices, cost prices, stock quantities, and variant finishes.
- **Order Processing & Tracking**: Filter orders by status (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled), update order status, update payment status, assign courier names and tracking numbers.
- **Category Vaults Management**: Add, edit, delete categories with slug and banner assets.
- **Coupons Management**: Create discount codes with percentage or flat values, minimum order thresholds, max discount caps, and active toggles.
- **Review Moderation**: Approve, reject, or delete customer reviews.
- **Customer Directory**: Inspect registered patron accounts and creation dates.
- **Banner Slideshow Management**: Configure homepage hero slides.

---

## 5. Default Credentials

| Role | Email | Password |
|---|---|---|
| **Master Admin** | `admin@auraatelier.com` | `AuraAdmin@2024` |
| **Demo Customer** | `patron@auraatelier.com` | `Customer@2024` |

*(Note: On the Login page `/login`, you can also click the **"Fill Admin Demo"** or **"Fill Customer"** button to autofill these credentials instantly!)*

---

## 6. Local Setup & Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Start the FastAPI Backend
```bash
cd backend

# Create .env file from example
copy .env.example .env

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn app.main:app --reload --port 8000
```
*The database automatically creates all schema tables and seeds initial luxury categories, products, coupons, and banners on first startup.*
- API root: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`

### Step 2: Start the Vite React Frontend
```bash
cd ../frontend

# Create .env file from example
copy .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```
- Open `http://localhost:5173` in your browser.

---

## 7. Automated Test Suite

A complete end-to-end integration test suite is included in `test_suite.py`:
```bash
python test_suite.py
```
This script exercises:
1. Health check endpoint
2. Category listings (10 categories)
3. Product catalog retrieval (12+ pieces)
4. User registration
5. User authentication & JWT issuing
6. Add item to cart
7. Retrieve cart with subtotal
8. Coupon code validation & discount computation (`AURA10`)
9. Server-side order checkout & inventory check
10. Razorpay payment signature verification
11. Admin authentication
12. Admin analytics retrieval

---

## 8. Supabase PostgreSQL Deployment

To connect directly to Supabase:
1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, run:
   - `supabase/migrations/20240101_initial_schema.sql` (Creates all tables, constraints, indexes, and triggers)
   - `supabase/rls_policies.sql` (Applies security policies for customers and admin)
   - `supabase/seed_data.sql` (Inserts initial luxury data)
3. In `backend/.env`, set:
   ```env
   DATABASE_URL="postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   SUPABASE_URL="https://your-project-ref.supabase.co"
   SUPABASE_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
4. Restart the backend.

---

## 9. Production Deployment

### Frontend (e.g. Vercel / Netlify):
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `dist/` folder or connect the repository to Vercel with build command `npm run build` and output directory `dist`.
3. Set environment variable `VITE_API_URL` to your production backend URL.

### Backend (e.g. Render / Railway / Fly.io):
1. Set the root directory to `backend/`.
2. Start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Set environment variables from `backend/.env.example`.

