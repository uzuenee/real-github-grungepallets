# Changelog

Notable changes per deployment. For a full file-by-file diff, see `docs/CHANGES_SINCE_LAST_COMMIT.md`.

## 2026-01-25

### Added

- Public form intake API routes: `POST /api/forms/contact`, `POST /api/forms/quote`, `POST /api/forms/pickup`
- n8n forwarding for form submissions (HMAC `X-Signature` using `N8N_WEBHOOK_SECRET`)
- Abuse controls: request size limits + best-effort rate limiting (`src/lib/security/**`)
- Optional pickup photo pipeline: validate base64 images, upload to Supabase Storage, forward URLs/paths (`src/lib/uploads/**`)
- Additional Supabase email templates + DB migration (`supabase/email-templates/**`, `supabase/migrations/**`)
- Test coverage for webhook/security utilities (`src/__tests__/n8nWebhook.test.ts`, `src/__tests__/security.test.ts`)

### Changed

- Admin pages + admin API routes updated (`src/app/admin/**`, `src/app/api/admin/**`)
- Profile API routes added/updated (`src/app/api/profile/**`)
- Email sending/notifications updated (`src/lib/email.ts`)
- Quote form photo previews now use `next/image` (`src/components/forms/QuoteForm.tsx`)
- Build stability: disabled Next experimental `workerThreads` (`next.config.js`)

