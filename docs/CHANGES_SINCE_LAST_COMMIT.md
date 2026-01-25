# Changes Since `origin/main` (aff5908)

Generated: 2026-01-25  
Local branch: `main`  
Base commit: `aff5908 feat: Add images, maps, real address, and custom typography`

This file is a checkpoint summary of everything changed locally compared to GitHub (`origin/main`) to help avoid accidentally losing work during pulls/resets.

## Summary

- `npm run lint`: clean (no warnings/errors)
- `npm test`: 13 suites / 209 tests passed
- `npm run build`: clean (no runtime stack traces)
- Tracked file changes: 76 files (approx. `+1574/-1694`)
- New files/paths: 24

## Tracked Files Changed (`git diff --name-status origin/main`)

M	.env.example
M	.eslintrc.json
M	.gitignore
M	MIGRATION.md
M	README.md
M	docs/images-needed.md
M	docs/supabase-email-templates.html
M	jest.config.js
M	next.config.js
M	src/__tests__/api.test.ts
M	src/__tests__/cart.test.tsx
M	src/__tests__/integration.test.ts
M	src/app/admin/orders/[id]/page.tsx
M	src/app/admin/page.tsx
M	src/app/admin/pickups/[id]/page.tsx
M	src/app/admin/products/page.tsx
M	src/app/api/admin/order-items/[itemId]/route.ts
M	src/app/api/admin/orders/[id]/route.ts
M	src/app/api/admin/pickups/[id]/route.ts
M	src/app/api/admin/pickups/route.ts
M	src/app/api/admin/upload/route.ts
M	src/app/api/admin/users/[id]/route.ts
M	src/app/api/categories/route.ts
M	src/app/api/email/contact/route.ts
M	src/app/api/email/quote/route.ts
M	src/app/api/orders/[id]/status/route.ts
M	src/app/api/orders/route.ts
M	src/app/api/pickups/route.ts
M	src/app/api/products/route.ts
M	src/app/api/profile/notifications/route.ts
M	src/app/api/profile/password/route.ts
M	src/app/api/profile/route.ts
M	src/app/auth/callback/route.ts
M	src/app/auth/confirm/route.ts
M	src/app/contact/page.tsx
M	src/app/forgot-password/page.tsx
M	src/app/login/page.tsx
M	src/app/portal/cart/page.tsx
M	src/app/portal/checkout/page.tsx
M	src/app/portal/orders/[id]/page.tsx
M	src/app/portal/orders/page.tsx
M	src/app/quote/page.tsx
M	src/app/reset-password/page.tsx
M	src/app/resources/choosing-right-pallet/page.tsx
M	src/app/resources/page.tsx
M	src/app/resources/pallet-grades-explained/page.tsx
M	src/app/resources/recycling-benefits/page.tsx
M	src/app/resources/sustainability-report-2024/page.tsx
M	src/app/signup/page.tsx
M	src/components/forms/ContactForm.tsx
M	src/components/forms/QuoteForm.tsx
M	src/components/layout/AuthLayout.tsx
M	src/components/layout/Footer.tsx
M	src/components/layout/Header.tsx
M	src/components/layout/PortalLayout.tsx
M	src/components/portal/PortalProductCard.tsx
M	src/components/sections/AboutContent.tsx
M	src/components/sections/Hero.tsx
M	src/components/sections/ProductsPreview.tsx
M	src/components/sections/ServiceAreaMap.tsx
M	src/components/sections/ServicesGrid.tsx
M	src/components/ui/ArticleCard.tsx
M	src/components/ui/Button.tsx
M	src/lib/constants.ts
M	src/lib/contexts/AuthContext.tsx
M	src/lib/contexts/CartContext.tsx
M	src/lib/contexts/ShopFilterContext.tsx
M	src/lib/email.ts
M	src/lib/supabase/types.ts
M	src/lib/types.ts
M	supabase/email-templates/confirm-signup.html
M	supabase/email-templates/email-changed.html
M	supabase/email-templates/mfa-added.html
M	supabase/email-templates/mfa-removed.html
M	supabase/email-templates/password-changed.html
M	supabase/email-templates/reset-password.html

## New Files/Paths Added (`git ls-files --others --exclude-standard`)

- `AGENT.md`
- `AGENTS.md`
- `PRD-n8n-airtable-webhooks.md`
- `SECURITY.md`
- `WORKLOG-n8n-airtable.md`
- `docs/PROJECT_BRIEF.md`
- `scripts/_n8n-webhook-test-quote.json`
- `scripts/test-n8n-webhooks.ps1`
- `src/__tests__/n8nWebhook.test.ts`
- `src/__tests__/security.test.ts`
- `src/app/api/forms/contact/route.ts`
- `src/app/api/forms/pickup/route.ts`
- `src/app/api/forms/quote/route.ts`
- `src/lib/security/escapeHtml.ts`
- `src/lib/security/rateLimit.ts`
- `src/lib/security/requestGuards.ts`
- `src/lib/security/safeRedirect.ts`
- `src/lib/uploads/base64Image.ts`
- `src/lib/uploads/supabaseIntakePhotos.ts`
- `src/lib/webhooks/n8n.ts`
- `supabase/email-templates/confirm-email-change.html`
- `supabase/email-templates/invite-user.html`
- `supabase/email-templates/magic-link.html`
- `supabase/migrations/20260123000000_add_pickup_charge.sql`

## Safety Notes (Avoid Losing Local Work)

- Avoid `git reset --hard` unless you’re 100% sure you don’t need the local changes.
- Prefer `git fetch` then `git pull --ff-only` to avoid surprise merges.
- Before any pull/rebase, run `git status` and ensure changes are committed.
