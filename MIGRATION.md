# Grunge Pallets - Migration Documentation

This document outlines all frontend resources and the backend requirements needed to make this application fully functional.

## 📄 Pages Overview

### Public Marketing Pages
| Route | Page | Status | Data Required |
|-------|------|--------|---------------|
| `/` | Homepage | ✅ Static | Company info |
| `/about` | About Us | ✅ Static | Team data (optional) |
| `/services` | Services | ✅ Static | Service offerings |
| `/products` | Products Catalog | ⚡ Dynamic | Products list |
| `/resources` | Blog Index | ⚡ Dynamic | Articles list |
| `/resources/[slug]` | Article Detail | ⚡ Dynamic | Article content |
| `/contact` | Contact Form | ⚡ API | Form submission |
| `/quote` | Quote Request | ⚡ API | Form submission |
| `/login` | Login | ⚡ Auth | Authentication |
| `/signup` | Signup | ⚡ Auth | User registration |

### Client Portal Pages
| Route | Page | Status | Data Required |
|-------|------|--------|---------------|
| `/portal` | Dashboard | ⚡ Dynamic | User stats, recent orders |
| `/portal/shop` | Shop Catalog | ⚡ Dynamic | Products with pricing |
| `/portal/cart` | Shopping Cart | ⚡ State | Cart items |
| `/portal/checkout` | Checkout | ⚡ API | Order creation |
| `/portal/order-confirmation` | Order Success | ✅ Static | Order ID |
| `/portal/orders` | Order History | ⚡ Dynamic | Orders list |
| `/portal/orders/[id]` | Order Detail | ⚡ Dynamic | Order details |
| `/portal/settings` | Account Settings | ⚡ Dynamic | User profile |

---

## 🧩 Components Requiring Backend Data

### UI Components
```
/components/ui/
├── ProductCard.tsx      → Product data
├── ArticleCard.tsx      → Article data
├── EmptyState.tsx       → Static
├── Skeleton.tsx         → Static (loading states)
├── Toast.tsx            → Static (notifications)
└── ...                  → Static
```

### Portal Components
```
/components/portal/
├── PortalProductCard.tsx → Products with pricing
└── CartPreview.tsx       → Cart state
```

### Form Components
```
/components/forms/
├── ContactForm.tsx       → API submission
└── QuoteForm.tsx         → API submission
```

---

## 🔌 API Endpoints Needed

### Public APIs
```
POST /api/contact
  - Body: { name, email, company, phone, message }
  - Response: { success: boolean, message: string }

POST /api/quote
  - Body: { type: 'buy'|'sell', ...formData }
  - Response: { success: boolean, quoteId: string }
```

### Authentication APIs
```
POST /api/auth/login
  - Body: { email, password }
  - Response: { token, user }

POST /api/auth/signup
  - Body: { companyName, contactName, email, phone, password }
  - Response: { success: boolean, message: string }

POST /api/auth/logout
  - Response: { success: boolean }

GET /api/auth/me
  - Headers: { Authorization: Bearer <token> }
  - Response: { user }
```

### Products APIs
```
GET /api/products
  - Query: { category?, search?, sort? }
  - Response: { products: Product[] }

GET /api/products/:id
  - Response: { product: Product }
```

### Portal APIs (Authenticated)
```
GET /api/portal/dashboard
  - Response: { stats, recentOrders }

GET /api/portal/products
  - Response: { products: WholesaleProduct[] }
  - Note: Includes pricing not shown publicly

POST /api/portal/cart
  - Body: { productId, quantity }
  - Response: { cart: CartItem[] }

GET /api/portal/cart
  - Response: { items: CartItem[] }

DELETE /api/portal/cart/:productId
  - Response: { cart: CartItem[] }

POST /api/portal/orders
  - Body: { items, deliveryNotes, paymentMethod }
  - Response: { orderId, status }

GET /api/portal/orders
  - Query: { status?, page?, limit? }
  - Response: { orders: Order[], total, page }

GET /api/portal/orders/:id
  - Response: { order: Order }

GET /api/portal/profile
  - Response: { user: PortalUser }

PUT /api/portal/profile
  - Body: { contactName?, email?, phone?, address? }
  - Response: { user: PortalUser }

PUT /api/portal/password
  - Body: { currentPassword, newPassword }
  - Response: { success: boolean }
```

### Content APIs (CMS)
```
GET /api/articles
  - Query: { category?, page?, limit? }
  - Response: { articles: Article[] }

GET /api/articles/:slug
  - Response: { article: Article }
```

---

## 🗄️ Database Tables Needed

### Users & Authentication
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  contact_name VARCHAR(255),
  phone VARCHAR(50),
  role ENUM('admin', 'client') DEFAULT 'client',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User addresses
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE
);
```

### Products
```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  category VARCHAR(50),
  size VARCHAR(50),
  dimensions VARCHAR(100),
  wood_type VARCHAR(50),
  load_capacity VARCHAR(50),
  entry_type VARCHAR(50),
  is_heat_treated BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product pricing (for wholesale)
CREATE TABLE product_pricing (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  price DECIMAL(10,2) NOT NULL,
  min_quantity INT DEFAULT 1,
  is_in_stock BOOLEAN DEFAULT TRUE
);
```

### Orders
```sql
-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  user_id UUID REFERENCES users(id),
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
  subtotal DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  total DECIMAL(10,2),
  delivery_notes TEXT,
  payment_method VARCHAR(50),
  delivery_address_id UUID REFERENCES user_addresses(id),
  created_at TIMESTAMP DEFAULT NOW(),
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL
);
```

### Cart (Session-based or Database)
```sql
-- Cart items (if using database)
CREATE TABLE cart_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Contact & Quotes
```sql
-- Contact submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(50),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quote requests
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY,
  type ENUM('buy', 'sell'),
  name VARCHAR(255),
  email VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(50),
  pallet_type VARCHAR(100),
  quantity INT,
  frequency VARCHAR(50),
  location TEXT,
  notes TEXT,
  status ENUM('new', 'contacted', 'quoted', 'closed'),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Articles (CMS)
```sql
-- Articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  category VARCHAR(50),
  image_url VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Environment Variables Needed

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# Storage (for file uploads)
S3_BUCKET=your-bucket
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_REGION=us-east-1

# Payment (future)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## ✅ Migration Checklist

1. **Setup Database**
   - [ ] Create PostgreSQL database
   - [ ] Run migration scripts
   - [ ] Seed initial products

2. **Authentication**
   - [ ] Implement JWT or session-based auth
   - [ ] Add protected route middleware
   - [ ] Connect login/signup forms

3. **Replace Mock Data**
   - [ ] `/lib/constants.ts` → API calls
   - [ ] `/lib/portal-data.ts` → API calls
   - [ ] `/lib/articles.ts` → CMS or API
   - [ ] `/lib/wholesale-products.ts` → API

4. **Connect Forms**
   - [ ] ContactForm → `/api/contact`
   - [ ] QuoteForm → `/api/quote`
   - [ ] Login/Signup → Auth APIs

5. **Connect Portal**
   - [ ] Dashboard stats from API
   - [ ] Shop products from API
   - [ ] Cart state to API
   - [ ] Orders from API

6. **Add Realtime Features (Optional)**
   - [ ] Cart sync across tabs
   - [ ] Order status notifications

---

## 📁 Files to Modify for Backend Integration

| File | Changes Needed |
|------|----------------|
| `lib/constants.ts` | Replace with API fetch |
| `lib/portal-data.ts` | Replace with API fetch |
| `lib/articles.ts` | Replace with CMS API |
| `lib/wholesale-products.ts` | Replace with API fetch |
| `lib/contexts/AuthContext.tsx` | Connect to real auth |
| `lib/contexts/CartContext.tsx` | Sync with backend cart |
| `app/portal/*/page.tsx` | Add data fetching |
| `components/forms/*.tsx` | Connect to APIs |

---

## 🎨 Design Tokens Reference

```css
/* Colors */
--primary: #F97316 (Orange 500)
--secondary: #1A1A1A (Near black)
--light: #F9FAFB (Gray 50)

/* Typography */
Font: Inter (Google Fonts)
Headings: font-black (900)
Body: font-normal (400)

/* Spacing */
Section padding: py-16 to py-24
Container: max-w-7xl mx-auto px-4
```

---

Generated: December 27, 2024
