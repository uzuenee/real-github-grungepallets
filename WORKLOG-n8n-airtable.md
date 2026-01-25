# Worklog: n8n ↔ Airtable Form Intake (Grunge Pallets)

Last updated: 2026-01-25

## What’s implemented in the app

### Server-side intake routes (source of truth)

- `POST /api/forms/quote`
- `POST /api/forms/pickup`
- `POST /api/forms/contact`

These routes:

- Validate/normalize payloads and generate/accept `submissionId` (UUID).
- Forward to n8n with signature headers:
  - `X-Form-Version`
  - `X-Idempotency-Key` (uses `submissionId`)
  - `X-Signature` = HMAC SHA-256 hex of the JSON body using `N8N_WEBHOOK_SECRET`
- Send admin emails via Resend (independent of the webhook forward).

Code:

- `src/app/api/forms/quote/route.ts`
- `src/app/api/forms/pickup/route.ts`
- `src/app/api/forms/contact/route.ts`
- Signing helper: `src/lib/webhooks/n8n.ts`

### Pickup photos

- Pickup photos can be uploaded to Supabase Storage for webhook processing.
- The upload path includes `pickup/<submissionId>/...` so n8n can delete by prefix later.
- Base64 parsing enforces size limits *before* decoding and validates real image type via magic bytes.

Code:

- `src/lib/uploads/base64Image.ts`
- `src/lib/uploads/supabaseIntakePhotos.ts`

### Abuse-resistance (best-effort)

- Public form routes enforce payload size caps and basic in-memory rate limiting.
- Helpers live in `src/lib/security/*`.

## Environment variables

Configured in `.env.local`:

- `N8N_WEBHOOK_SECRET` (required for forwarding)
- `N8N_QUOTE_WEBHOOK_URL`
- `N8N_PICKUP_WEBHOOK_URL`
- `N8N_CONTACT_WEBHOOK_URL`
- `SUPABASE_INTAKE_BUCKET` (public bucket for intake photos)
- `FORMS_INCLUDE_IP=false` (default)
- `FORMS_STORE_PICKUP_PHOTOS_IN_SUPABASE=true` (default; set `false` to skip photo upload)

Notes:

- n8n `/webhook-test/...` endpoints usually require “Execute workflow” and are one-shot; production uses `/webhook/...` with the workflow Active.

## Ops follow-ups (not implemented in app)

- Add an n8n cron workflow to delete Supabase intake images after a retention period (e.g. 7 days) using `photoPaths`.
- Add edge rate limiting (Cloudflare/Vercel WAF/etc) for stronger guarantees than in-memory counters.

