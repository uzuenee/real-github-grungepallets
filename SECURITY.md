# Security Notes

This document is a practical overview of abuse-resistance controls in the codebase. It is not a complete threat model.

## High-level Controls

- Authentication uses Supabase cookies via `@supabase/ssr` (`src/lib/supabase/server.ts`).
- Admin endpoints verify `profiles.is_admin` (often via `createAdminClient()` to bypass RLS for admin-only reads).
- Public form endpoints are hardened against basic abuse (payload size checks + best-effort rate limiting).

## Abuse / DoS Mitigations

### Request size limits

Several route handlers reject large requests early using `Content-Length`:
- Helper: `src/lib/security/requestGuards.ts`

### Rate limiting

Best-effort in-memory counters are used to throttle high-risk endpoints:
- Helper: `src/lib/security/rateLimit.ts`
- Wrapper: `src/lib/security/requestGuards.ts`

Important: in-memory limits reset on server restarts and won’t coordinate across multiple instances. For production, also configure a CDN/WAF rate limit.

### Form intake + webhooks

Public intake routes:
- Validate required fields and bounds
- Generate/accept `submissionId` (UUID)
- Optionally forward payloads to n8n using HMAC SHA-256 signatures (`src/lib/webhooks/n8n.ts`)

## File Upload Safety

- Admin product image upload validates MIME type and size (`src/app/api/admin/upload/route.ts`).
- Pickup intake photos (base64) are validated for size and for *actual image type* (magic bytes) before upload (`src/lib/uploads/base64Image.ts`).

## Redirect Safety

Auth routes sanitize `next` redirects to same-origin relative paths:
- Helper: `src/lib/security/safeRedirect.ts`

## Reporting Security Issues

If this repo is deployed, treat secrets and production logs as sensitive. Prefer private disclosure to the maintainer.

