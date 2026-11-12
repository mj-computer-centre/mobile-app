# CLAUDE.md

Guidance for Claude Code (and any engineer) working in this repository. Read this first; it is short on purpose and links to the detail.

## What this is

A free learning app for **Mishra Computer Centre** (Makhdumpur, Jehanabad, Bihar). Students sign in with Google and watch the centre's courses (ADCA, DCA, Tally…): YouTube videos that play **inside the app** and PDF notes read **inside the app**. The owner manages courses → units → videos and PDFs from an admin panel that runs both in the app and as a website. Free now; paid courses are planned (backlog PAY-*).

- **Built:** database schema and access rules, edge functions, shared domain package, the Android/web app (student screens and admin panel). See [docs/BACKLOG.md](docs/BACKLOG.md).
- **Not built yet:** anything needing the owner's accounts (Supabase project, Google OAuth clients, Play Console) and the items in the backlog marked `todo`. Never describe planned behaviour as if it exists.

## Docs map

| Need                                                                           | Read                                                                       |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| The plan agreed with the owner                                                 | [docs/PLAN.md](docs/PLAN.md)                                               |
| How it is built, module boundaries                                             | [docs/architecture/overview.md](docs/architecture/overview.md)             |
| Tables, relationships, access rules                                            | [docs/architecture/data-model.md](docs/architecture/data-model.md)         |
| Why videos can never leave the app                                             | [docs/architecture/video-playback.md](docs/architecture/video-playback.md) |
| Why it is built that way                                                       | [docs/adr/](docs/adr/README.md)                                            |
| Stories and status                                                             | [docs/BACKLOG.md](docs/BACKLOG.md)                                         |
| Open questions for the owner (never block on them: use the default and log it) | [docs/QUESTIONS.md](docs/QUESTIONS.md)                                     |
| Tests and the manual QA checklist                                              | [docs/TESTING.md](docs/TESTING.md)                                         |
| Setting up Supabase, Google sign-in, YouTube API                               | [docs/operations/supabase.md](docs/operations/supabase.md)                 |
| Builds, Play Store, closed testing                                             | [docs/operations/release.md](docs/operations/release.md)                   |

## Commands

```bash
pnpm install                 # pnpm 12 via corepack (`corepack enable` once)
pnpm dev                     # Expo dev server (needs a development build on the phone)
pnpm dev:web                 # admin website in the browser
pnpm typecheck && pnpm lint && pnpm format:check && pnpm check:file-length
pnpm test                    # unit tests (vitest, packages/shared)
pnpm db:verify               # migrations + access-rule tests on a throwaway local Postgres
pnpm functions:check         # deno check for the edge functions
pnpm check                   # everything above, as CI runs it
pnpm build:web               # static admin website in apps/mobile/dist
```

## Repository layout

```
apps/mobile        Expo SDK 58 app (Android + web admin). Routes in src/app (thin), features in src/features
packages/shared    Framework-free domain: types, Zod schemas, YouTube parsing, player navigation policy, money, CSV
supabase/          migrations, edge functions (Deno), SQL tests, seed, CLI config
scripts/           check-file-length.mjs (+ grandfather list), verify-db.mjs
docs/              plan, architecture, ADRs, backlog, questions, operations
```

Inside `apps/mobile/src`:

```
app/         Expo Router routes. One line each where possible: import a screen from a feature.
app-shell/   Providers and the setup screen.
features/    auth, profile, catalog, player, notes, contact, home, legal, admin (sub-areas inside).
             Each feature exposes a public index.ts; nothing imports a feature's internals.
lib/         Infrastructure: env, Supabase client, data helpers, query client, routes, platform helpers.
ui/          Design system: theme tokens and small components. Knows nothing about features.
```

## Rules that must not be broken

1. **Videos never leave the app.** All player navigation goes through `isAllowedPlayerRequest` (`packages/shared/src/player/navigation-policy.ts`). Keep `setSupportMultipleWindows={false}`, the `onOpenWindow` no-op and the library's `originWhitelist={['*']}` (a narrower list hands URLs to the phone). Read [video-playback.md](docs/architecture/video-playback.md) before touching `features/player`.
2. **Access is enforced in the database.** Every table has row-level security; the app's checks are for UX only. Staff-only writes to course membership go through the `attach_*`/`detach_*`/`reorder_*` functions. A new table needs RLS and tests in `supabase/tests`. Roles live in `staff`, never on `profiles`.
3. **Contracts are shared.** Form schemas, mappers and the `youtube-meta` response schema live in `@mcc/shared`. The edge function's YouTube parser is a copy; `youtube-url-parity.test.ts` keeps them identical.
4. **Database types match migrations.** After a migration, regenerate `packages/shared/src/db/generated/database.types.ts` (or update it by hand until the project exists) in the same change.
5. **Money is integer paise**; format with `formatInr`.
6. **No secrets in the app.** Only `EXPO_PUBLIC_*` public values in `apps/mobile`; the service-role key and the YouTube API key live in Supabase secrets.
7. **Personal data stays out of logs and the on-device cache.** Only `catalog` queries are persisted to disk (`lib/query-persister.ts`).
8. **File size.** No code file over **600 lines** (`.ts .tsx .js .jsx .mjs .cjs .css .sql`). See below.
9. **The dev bypass stays dev-only.** `EXPO_PUBLIC_DEV_AUTH_BYPASS` (`src/lib/dev-bypass.ts`) is read only when `__DEV__`; `supabase()` throws `demo_mode` while it is on; `app.config.ts` fails release builds while it is set; demo data lives only in `src/dev/` and the query cache. Keep all four guards. New screens that need data in demo mode get fixtures in `src/dev/seed-demo-cache.ts`.

## File size (600-line rule)

`pnpm check:file-length` enforces it in CI. Split by responsibility before a file nears the limit:

- Features: `api.ts` (data access), `hooks.ts` (React Query), `screens/*` or `*-screen.tsx` (composition), `components/*` (one component per file).
- Admin: one folder per area (`courses/`, `sections/`, `lessons/`, `people/`, `home-content/`), each with its own api/hooks/screens.
- SQL: one migration per concern; one test file per area.

`scripts/file-length-grandfather.json` lists exceptions (currently none). A listed file may shrink, never grow; remove its entry once it is under the limit, because the check fails on stale entries. Add an entry only with a reason and a backlog story, and only when splitting is genuinely worse. Generated files under `generated/` are exempt.

## Code conventions

- TypeScript strict everywhere, `noUncheckedIndexedAccess` on.
- Follow the style of the surrounding code: naming, comment density (comments explain why), error handling.
- Errors: database functions raise `mcc:<code>`; edge functions return `{ error: { code } }`; the app shows `toAppError(error).message`. Add new codes to `packages/shared/src/errors.ts`.
- Navigation uses `routes` from `@/lib/routes`, never hand-typed paths.
- UI copy: plain English for Indian students and a non-technical owner, ₹ with Indian grouping, no jargon.
- Before using an Expo or React Native API, check the installed version's docs (Expo ships breaking changes every SDK).

## Workflow

1. Pick a story from [docs/BACKLOG.md](docs/BACKLOG.md).
2. Branch: `feat/<area>-<topic>`, `fix/<area>-<topic>`, `docs/<topic>`.
3. Write tests with the code: pure logic in `packages/shared` (vitest), access rules in `supabase/tests`.
4. Verify with `pnpm check` and, for player or upload changes, the manual checklist in [docs/TESTING.md](docs/TESTING.md).
