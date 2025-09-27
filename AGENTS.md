# Repository Guidelines

## Project Structure & Module Organization
Next.js App Router drives the app. Routes live in `app/` (e.g. `app/events`, `app/signin`, `app/signup`) with shared layout in `app/layout.tsx` and global styles in `app/globals.css`. Reusable UI sits in `components/`; `components/ui` holds Radix/Tailwind primitives and `*-client.tsx` wrappers handle browser-only state. Shared utilities live in `lib/` (Supabase clients, middleware, and helpers). Static assets belong in `public/`, Tailwind overrides in `styles/globals.css`, and database artefacts in `supabase/` for migrations plus seeds.

## Build, Test, and Development Commands
Set up the toolchain with `mise install`. Install dependencies via `pnpm install`. Use `pnpm dev` for local development, `pnpm build` to verify production output, and `pnpm start` to simulate Vercel. Run `pnpm lint` before committing to satisfy Next.js ESLint rules. When schema changes arise, refresh your local Supabase stack with `pnpm dlx supabase db reset --linked --seed`.

## Coding Style & Naming Conventions
Write TypeScript; align filenames with their default exports. Components, hooks, and contexts use PascalCase, while helpers use camelCase. Favor server components and keep client modules lean. Compose styles with Tailwind utility classes and the `cn` helper instead of custom CSS. Maintain 2-space indentation enforced by `pnpm lint`.

## Testing Guidelines
No automated suite exists yet, so smoke-test critical flows (`/signin → /events`) before each PR. When adding coverage, colocate React tests in `__tests__/` using React Testing Library, and reserve Playwright-style E2E checks for Supabase auth paths. Document manual steps and command outputs (`pnpm lint`, `pnpm build`) in the PR description until CI is in place.

## Commit & Pull Request Guidelines
History blends Conventional Commits with imperative sentences. Keep the first line under ~70 characters, prefer a type prefix for features and fixes, and batch related Supabase migration plus seed changes together. PRs should include a short summary, linked issue, screenshots when UI changes, environment or schema notes, and a test checklist.

## Communication Preferences
プロジェクト関連の会話や Pull Request の議論は日本語で行ってください。Summaries can include short English glossaries when clarifying technical terms, but default to Japanese for all contributor-facing dialogue.

## Environment & Security Notes
Local development requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optionally `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` in `.env.local`; never commit `.env*` or service-role keys. Middleware-based auth depends on cookies—clear browser storage when debugging. If a Supabase key leaks, rotate it and update local and Vercel settings immediately.
