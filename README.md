# Grunge Pallets

B2B website + client portal for pallet supply, recycling, and logistics services.

## Tech Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Storage)
- Resend (transactional email)
- n8n (optional intake webhooks for forms)

## Getting Started

### Prereqs

- Node.js (18+ recommended)
- Supabase project (or local Supabase)

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env.local` and fill values (never commit secrets):

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`
- Forms → n8n (optional): `N8N_*_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`
- Pickup photo intake (optional): `SUPABASE_INTAKE_BUCKET`

### Run

```bash
npm run dev
```

PowerShell note: if `npm` is blocked by execution policy, use `npm.cmd` (example: `npm.cmd test`).

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint`
- `npm test` (Jest)

## API Routes (high level)

- Catalog: `GET /api/products`, `GET /api/categories`
- Forms (public): `POST /api/forms/contact`, `POST /api/forms/quote`, `POST /api/forms/pickup`
- Portal (auth): `GET|POST /api/orders`, `GET /api/orders/[id]`, `POST /api/profile/password`, etc.
- Admin (auth + `profiles.is_admin`): `src/app/api/admin/**`

## Security Notes

- Public form endpoints enforce payload size limits and basic in-memory rate limiting (best-effort) in `src/lib/security/*`.
- Pickup photo uploads validate content type/size and reject unknown raw base64 data.
- Auth redirects sanitize `next` parameters to same-origin paths.
