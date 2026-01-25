# Changelog

Notable changes per deployment.

For a full file-by-file diff, see `docs/CHANGES_SINCE_LAST_COMMIT.md` (created as a one-time safety checkpoint during this batch of work).

## 2026-01-25 (aff5908 → a4305b1)

### Admin Panel

- Orders tab: list + filtering + detail panel, with “ready to confirm” checks (requires delivery fee/date + custom item pricing)
- Order detail: edit delivery fee/date, change status, copy order IDs, view customer contact/address
- Custom item pricing: admin can set unit price per custom item, auto-recalculate totals, and email customers about updates
- User management: approve users, grant/revoke admin (prevents removing your own admin), delete users via Supabase Admin API
- Pickup management: list + detail pages, schedule date, set actual quantity, set price-per-pallet, pickup charge, admin notes, and total payout calculations

### Products & Categories

- Products admin page: CRUD products, stock flags, heat-treated/protected flags, search/filtering, and sort/order controls
- Categories admin: CRUD categories, active toggle (controls shop visibility), color labels, drag-and-drop ordering, deletion safeguards
- Admin upload route: safer image upload handling and validation (`src/app/api/admin/upload/route.ts`)

### Customer Portal

- Profile API: fetch/update profile fields with request-size limits + rate limiting (`src/app/api/profile/route.ts`)
- Password change API: verifies current password + rate limiting (`src/app/api/profile/password/route.ts`)
- Notification preferences API: persisted preferences with mandatory transactional toggles enforced (`src/app/api/profile/notifications/route.ts`)
- Portal UX updates across cart/checkout/orders/reset-password/signup flows (`src/app/portal/**`, `src/app/reset-password/page.tsx`, `src/app/signup/page.tsx`)

### Forms → n8n Webhooks

- Public form intake routes: `POST /api/forms/contact`, `POST /api/forms/quote`, `POST /api/forms/pickup`
- Server-side forwarding to n8n with HMAC (`X-Signature`) + idempotency (`X-Idempotency-Key`) using `N8N_WEBHOOK_SECRET`
- Abuse controls: request size checks + best-effort rate limiting on public endpoints (`src/lib/security/**`)
- Pickup photos pipeline (optional): validate base64 images via magic bytes, upload to Supabase Storage, forward URLs/paths (`src/lib/uploads/**`)
- Local test tooling for webhook forwarding: `scripts/test-n8n-webhooks.ps1`

### Email & Templates

- Email system refactor: safer HTML escaping, header sanitization, and richer order pricing breakdowns (`src/lib/email.ts`)
- Customer emails: order confirmation, order status updates, order details updates, pickup confirmation
- Admin emails: new order, new user, contact submissions, quote submissions, pickup submissions
- Supabase auth email templates added/updated (`supabase/email-templates/**`)

### Database

- Migration added for pickup charge support: `supabase/migrations/20260123000000_add_pickup_charge.sql`

### Build/Tooling

- Build stability: disabled Next experimental `workerThreads` to avoid noisy build-time runtime errors (`next.config.js`)
- Tests updated/added for webhook/security utilities (`src/__tests__/n8nWebhook.test.ts`, `src/__tests__/security.test.ts`)
