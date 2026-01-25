# Grunge Pallets & Recycling Services
## Website Development Project Brief & Invoice

**Client:** Grunge Pallets & Recycling Services  
**Location:** 1925 Jason Industrial Parkway, Winston, GA 30187  
**Project Completion Date:** January 2026  

## Executive Summary

A B2B e-commerce and business management platform for Grunge Pallets & Recycling Services. The site includes public marketing pages plus an authenticated client portal for ordering, pickup requests, and account administration.

## Project Scope & Deliverables

### 1. Marketing Website (Public)

- Homepage (hero, services preview, products preview, service area map, CTAs)
- Services page (offerings, process, FAQ)
- About page (company story, values, service area)
- Contact page (validated form submission)
- Quote/Pickup request system (validated submissions; optional photo intake)
- Resources/blog section (index + article pages)

### 2. Client Portal (Authenticated)

- User registration + approval workflow
- Password reset + change password
- Product catalog, cart, checkout
- Order history + order detail
- Pallet pickup request creation + history
- Account settings + notification preferences

### 3. Admin Panel

- User management (approval + admin toggles)
- Order management (status, delivery date/price, custom item pricing)
- Pickup management (status, scheduling, admin notes)
- Product + category management
- Product image upload (Supabase Storage)

### 4. Email System

Transactional emails (Resend):
- Order confirmations and status updates
- Pickup confirmations and admin notifications
- Quote/contact admin notifications
- Admin notification on new user registration

### 5. Technical Implementation

#### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React icons

#### Backend

- Supabase Postgres + RLS
- Supabase Auth (cookie-based sessions)
- Supabase Storage (product images; optional pickup intake bucket)
- Next.js route handlers under `src/app/api/**`
- Optional: n8n webhooks for intake pipeline automation

#### Security (high level)

- RLS on tables; authenticated routes use Supabase sessions.
- Admin-only routes verify `profiles.is_admin`.
- Public intake routes validate inputs and enforce basic abuse resistance (payload size limits + best-effort rate limiting).
- Webhook forwarding uses HMAC signatures (`X-Signature`) when configured.

## Pricing Breakdown

| Feature Category | Description | Price |
|-----------------|-------------|-------|
| Marketing Website | Public pages + responsive design | $120 |
| Client Portal | Dashboard, Shop, Cart, Orders, Pickups, Settings | $150 |
| Admin Panel | Users, Orders, Pickups, Products CRUD | $100 |
| Email System | Transactional emails + branded templates | $40 |
| Database & Auth | Supabase schema, RLS, auth flows | $50 |
| Design & Typography | Custom fonts + component system | $40 |
| Image Integration | Image placements + maps integration | $25 |
| SEO & Meta | Meta tags + structured data | $15 |
| Testing & QA | Cross-browser testing + polish | $10 |

## Total Project Cost

| | |
|---|---|
| Subtotal | $550.00 |
| Discount | $0.00 |
| Tax | N/A |
| TOTAL DUE | **$550.00** |

## Delivery Notes

Included:
- Complete source code
- Supabase schema/migrations and configuration
- Environment variable template (`.env.example`)
- Documentation files under `docs/`

Client responsibilities:
- Supabase project hosting
- Domain/DNS
- Deployment hosting (Vercel/Netlify recommended)
- Email provider credentials (Resend)
- Ongoing content updates

Post-launch support:
- 30 days of bug fixes included

