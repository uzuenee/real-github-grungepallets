# Grunge Pallets – Database & API Notes

This document summarizes the current backend requirements for the app (Supabase schema + key API routes). Schema changes are tracked in `supabase/migrations/`.

## Core Tables (Supabase)

- `profiles`: user profile + flags (`approved`, `is_admin`, contact + address fields, `notification_preferences`)
- `categories`: product categories (active + sort order)
- `products`: catalog items (category, pricing, in-stock, image metadata, sort order)
- `orders`: customer orders (status, totals, delivery details, user ownership)
- `order_items`: line items for orders (including optional `custom_specs`)
- `pickups`: pallet pickup requests (status, quantities, admin notes/pricing fields)

Notes:
- Row Level Security (RLS) is expected; server routes use Supabase auth cookies.
- Admin operations use `SUPABASE_SERVICE_ROLE_KEY` via `createAdminClient()` in `src/lib/supabase/server.ts`.

## API Routes (current)

### Public catalog

- `GET /api/products`
- `GET /api/categories`

### Public forms (intake)

- `POST /api/forms/contact`
- `POST /api/forms/quote`
- `POST /api/forms/pickup` (supports up to 3 photos; optional upload to Supabase intake bucket)

These routes can forward to n8n via webhook URLs and an HMAC signature (see `src/lib/webhooks/n8n.ts`).

### Authenticated (portal)

- `GET|POST /api/orders`
- `GET /api/orders/[id]`
- `POST /api/orders/[id]/status` (admin-only status updates used by admin UI)
- `GET|POST /api/pickups`
- `GET|PATCH|DELETE /api/pickups/[id]`
- `GET|PATCH /api/profile`
- `GET|PATCH /api/profile/notifications`
- `POST /api/profile/password`

### Admin (requires `profiles.is_admin`)

See `src/app/api/admin/**`:
- Products, categories, orders, pickups, users
- Image upload: `POST /api/admin/upload` (Supabase Storage)

## Environment Variables

Start from `.env.example` and create `.env.local`.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for admin operations + storage uploads)

Email:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_EMAIL`

Forms → n8n (optional):
- `N8N_WEBHOOK_SECRET`
- `N8N_CONTACT_WEBHOOK_URL`
- `N8N_QUOTE_WEBHOOK_URL`
- `N8N_PICKUP_WEBHOOK_URL`

Pickup photo intake (optional):
- `SUPABASE_INTAKE_BUCKET`
- `FORMS_STORE_PICKUP_PHOTOS_IN_SUPABASE` (default true)
- `FORMS_INCLUDE_IP` (default false)

## Operational Notes

- Public intake routes enforce payload size limits and basic in-memory rate limiting in `src/lib/security/*`. In production, add a CDN/WAF rate limit for stronger guarantees.
