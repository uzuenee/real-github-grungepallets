# PRD: n8n Webhooks → Airtable (+ optional spreadsheet mirror)

This describes the intended intake pipeline for website submissions (Quote, Pickup, Contact) using n8n webhooks. The app is the source of truth for validation and signing; n8n handles storage/automation.

## Goals

- Capture all intake submissions via HTTPS webhooks.
- Validate payloads and enforce a stable contract (versioned).
- Write each submission to Airtable in a consistent schema.
- Optionally mirror the same data into a spreadsheet destination (default: Google Sheets).
- Provide observability and idempotency (no duplicates on retries).

## Non-goals

- Building a CRM.
- Storing raw binary attachments in Airtable in v1 (store URLs/metadata).

## High-level Architecture

1. Client submits to the app:
    - `POST /api/forms/quote`
    - `POST /api/forms/pickup`
    - `POST /api/forms/contact`
2. The app:
    - validates and normalizes payloads
    - generates/accepts `submissionId` (UUID)
    - signs payload using HMAC SHA-256 and forwards to n8n
3. n8n workflow:
    - verifies signature
    - validates version and required fields
    - writes to Airtable (upsert by `submissionId`)
    - optionally appends to a sheet
    - returns a receipt

## Webhook Contract (v1)

### Headers

- `Content-Type: application/json`
- `X-Form-Version: 1`
- `X-Idempotency-Key: <submissionId>`
- `X-Signature: <hex>` (HMAC SHA-256 of raw JSON body using shared secret)

### Response (success)

- Status: `200 OK`
- Body:
    - `ok: true`
    - `submissionId: string`
    - `receiptId?: string`

### Response (validation error)

- Status: `400 Bad Request`

### Response (transient upstream error)

- Status: `502 Bad Gateway`
- Body includes `retryable: true`

## Environment Variables

Server-side forwarding keeps secrets off the client.

- `N8N_WEBHOOK_SECRET` (required)
- `N8N_QUOTE_WEBHOOK_URL`
- `N8N_PICKUP_WEBHOOK_URL`
- `N8N_CONTACT_WEBHOOK_URL`

Optional toggles:
- `FORMS_INCLUDE_IP=false` (default)
- `FORMS_STORE_PICKUP_PHOTOS_IN_SUPABASE=true` (default; set `false` to skip photo upload)

Pickup photo storage:
- `SUPABASE_INTAKE_BUCKET` (public bucket used for temporary intake URLs)

## Pickup Photos (recommended flow)

1. App uploads photos to Supabase Storage (public URLs) and forwards only `photoUrls`/`photoPaths`.
2. n8n optionally downloads the URLs and archives to Drive/S3.
3. n8n periodically deletes Supabase objects older than a retention window (e.g. 7 days) using `photoPaths`.

## Security Requirements

- Enforce HTTPS-only endpoints.
- Verify `X-Signature` in n8n using the shared secret.
- Use idempotency with `submissionId` to prevent duplicates on retries.
- Apply rate limiting at the edge (CDN/WAF) in production; the app also includes best-effort limits for basic abuse resistance.

