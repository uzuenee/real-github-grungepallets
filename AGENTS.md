# Repository Guidelines

## Project Structure & Module Organization

- `src/app/`: Next.js App Router pages, layouts, and route handlers (`src/app/api/**`).
- `src/components/`: Reusable React components (`layout/`, `sections/`, `ui/`, `portal/`).
- `src/lib/`: Shared utilities, types, and Supabase helpers (`src/lib/supabase/**`).
- `src/__tests__/`: Jest tests (`*.test.ts` / `*.test.tsx`).
- `public/`: Static assets served from the site root.
- `supabase/`: Local Supabase config, migrations, and email templates.

Use the `@/` import alias for app code (maps to `src/`), e.g. `import { Button } from '@/components/ui'`.

## Build, Test, and Development Commands

- `npm install`: Install dependencies.
- `npm run dev`: Start local dev server (Next.js).
- `npm run build`: Production build.
- `npm run start`: Run the production server after a build.
- `npm run lint`: Run ESLint (Next.js config).
- `npm test`: Run Jest once.
- `npm run test:watch`: Run Jest in watch mode.
- `npm run test:coverage`: Run Jest with coverage reporting.

Windows PowerShell note: if `npm` is blocked by execution policy, use `npm.cmd` (e.g. `npm.cmd test`).

## Coding Style & Naming Conventions

- Language: TypeScript + React (Next.js 14).
- Indentation: 4 spaces; keep formatting consistent with surrounding files.
- Components: `PascalCase` in `src/components/**` (e.g., `ProductCard.tsx`).
- Utilities/types: `camelCase` exports; type names in `PascalCase`.
- Routes: folder names in `src/app/**` define URLs; keep route segments kebab-case (e.g., `forgot-password/`).

## Testing Guidelines

- Framework: Jest + React Testing Library (JSDOM).
- Location/naming: add tests under `src/__tests__/` using `*.test.ts(x)`.
- Prefer integration-style tests for critical flows (auth, portal, admin APIs) and small unit tests for utilities.

## Configuration & Secrets

- Start from `.env.example` and create a local `.env.local` (do not commit secrets).
- Supabase schema changes should be captured via `supabase/migrations/` and documented when needed in `MIGRATION.md`.

## Commit & Pull Request Guidelines

- Commits: follow the existing "type: summary" pattern when possible (`feat:`, `fix:`, `test:`). Avoid vague messages like "Changes".
- PRs: include a clear description, link related issues, and add screenshots for UI changes (especially `src/app/**` and `src/components/**`).

## Security & Abuse Controls

- Request guards live in `src/lib/security/requestGuards.ts` (payload size + IP/user rate limiting helpers).
- Best-effort in-memory rate limiting lives in `src/lib/security/rateLimit.ts` (sufficient for basic abuse control; use a WAF/CDN rate limit in production).
- Redirect sanitization is in `src/lib/security/safeRedirect.ts` and is used by auth callback/confirm routes.
