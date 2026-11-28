# CLAUDE.md

Guidance for Claude Code (and any engineer) working in this repository. Read this first; it is short on purpose and links to the detail.

## What this is

A learning app for **Mishra Computer Centre** (Makhdumpur, Jehanabad, Bihar). Students sign in with Google and follow the centre's courses (ADCA, DCA, Tally…): YouTube videos that play **inside the app**, PDF notes read **inside the app**, and **timed tests**. The owner manages courses → units → videos and PDFs, and tests, from an admin panel, and gives each course a cover picture: uploaded, or drawn by AI. Free now; paid courses are planned (backlog PAY-\*).

One Expo codebase is three things:

- the **Android app** (students, and an Admin tab for staff);
- the **website**: public pages anyone can read (home, courses, a course's outline, tests, contact, privacy policy, account deletion), the same student app after sign-in, and the admin panel;
- nothing else: there is no separate marketing site or server.

- **Built:** database schema and access rules, edge functions, shared domain package, the app and website (student screens, tests, public pages, admin panel), the design system, pictures on Cloudinary and AI course covers. See [docs/BACKLOG.md](docs/BACKLOG.md).
- **Not built yet:** the items in the backlog marked `todo`, and whatever needs the owner's accounts (`blocked`). Never describe planned behaviour as if it exists.

## Docs map

| Need                                                                           | Read                                                                         |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| The plan agreed with the owner, and what was added since                       | [docs/PLAN.md](docs/PLAN.md)                                                 |
| How it is built, module boundaries, who sees what on the website               | [docs/architecture/overview.md](docs/architecture/overview.md)               |
| Tables, relationships, access rules                                            | [docs/architecture/data-model.md](docs/architecture/data-model.md)           |
| How tests behave (window, deadline, late attempts, answers)                    | [docs/architecture/tests.md](docs/architecture/tests.md)                     |
| The look: tokens, components, and the rules that keep it                       | [docs/architecture/design-system.md](docs/architecture/design-system.md)     |
| Why videos can never leave the app                                             | [docs/architecture/video-playback.md](docs/architecture/video-playback.md)   |
| Why it is built that way                                                       | [docs/adr/](docs/adr/README.md)                                              |
| Stories and status                                                             | [docs/BACKLOG.md](docs/BACKLOG.md)                                           |
| Open questions for the owner (never block on them: use the default and log it) | [docs/QUESTIONS.md](docs/QUESTIONS.md)                                       |
| Tests and the manual QA checklist                                              | [docs/TESTING.md](docs/TESTING.md)                                           |
| Setting up Supabase, Google sign-in, YouTube API; pushing migrations           | [docs/operations/supabase.md](docs/operations/supabase.md)                   |
| Cloudinary and Cloudflare keys, the picture functions                          | [docs/operations/supabase.md](docs/operations/supabase.md), sections 4 and 5 |
| Builds, the website, Play Store, closed testing                                | [docs/operations/release.md](docs/operations/release.md)                     |

## Commands

```bash
pnpm install                 # pnpm 12 via corepack (`corepack enable` once)
pnpm dev                     # Expo dev server (needs a development build on the phone)
pnpm dev:web                 # the website in the browser
pnpm typecheck && pnpm lint && pnpm format:check && pnpm check:file-length
pnpm test                    # unit tests (vitest, packages/shared)
pnpm db:verify               # migrations + access-rule tests on a throwaway local Postgres
pnpm functions:check         # deno check for the edge functions
pnpm images:verify           # proves the Cloudinary and Cloudflare keys work (real requests, prints no key)
pnpm check                   # everything above, as CI runs it
pnpm build:web               # the static website in apps/mobile/dist
```

To see screens without a backend, set `EXPO_PUBLIC_DEV_AUTH_BYPASS` in `apps/mobile/.env.local` to `visitor`, `student`, `admin` or `owner` (README, "Try it without a backend").

## Repository layout

```
apps/mobile        Expo SDK 58 app (Android + website). Routes in src/app (thin), features in src/features
packages/shared    Framework-free domain: types, Zod schemas, YouTube parsing, player navigation policy,
                   test status and question import, dates, money, CSV
supabase/          migrations, edge functions (Deno), SQL tests, seed, CLI config. functions/.env holds the
                   functions' secrets on your machine (git-ignored; names in functions/.env.example)
scripts/           check-file-length.mjs (+ grandfather list), verify-db.mjs
docs/              plan, architecture, ADRs, backlog, questions, operations
```

Inside `apps/mobile/src`:

```
app/         Expo Router routes. One line each where possible: import a screen from a feature.
app-shell/   Providers, fonts, the three navigation bars (bottom tabs, sidebar, public top bar).
features/    auth, profile, catalog, player, notes, tests, contact, home, site (the public
             website), legal, admin (sub-areas inside). Each feature exposes a public index.ts;
             nothing imports a feature's internals.
lib/         Infrastructure: env, Supabase client, data helpers, query client, routes, page titles.
ui/          Design system: theme tokens and components. Knows nothing about features.
dev/         Demo data for the dev bypass.
```

## Rules that must not be broken

1. **Videos never leave the app.** All player navigation goes through `isAllowedPlayerRequest` (`packages/shared/src/player/navigation-policy.ts`). Keep `setSupportMultipleWindows={false}`, the `onOpenWindow` no-op and the library's `originWhitelist={['*']}` (a narrower list hands URLs to the phone). Read [video-playback.md](docs/architecture/video-playback.md) before touching `features/player`.
2. **Access is enforced in the database.** Every table has row-level security; the app's checks are for UX only. Staff-only writes to course membership go through the `attach_*`/`detach_*`/`reorder_*` functions, and test questions through `save_test_question` and its siblings. A new table needs RLS and tests in `supabase/tests`. Roles live in `staff`, never on `profiles`.
3. **A visitor who has not signed in reads only what `supabase/tests/07_public_site.test.sql` allows:** published course rows, and titles, counts and times through the `public_*` functions. Nothing that plays. Widening that is a decision for the owner, with a test.
4. **Tests are timed and marked by the database.** The app never decides whether a test is open, whether time is up, or what a score is; it shows what `start_test`, `my_tests` and `test_attempt_summary` say. The answer key (`test_answer_keys`) never reaches a student except through `test_attempt_review`. See [tests.md](docs/architecture/tests.md).
5. **Contracts are shared.** Form schemas, mappers and the edge functions' request and response schemas (`youtube-meta`, `course-image`, `upload-image`, `remove-images`) live in `@mcc/shared`. The edge function's YouTube parser is a copy; `youtube-url-parity.test.ts` keeps them identical. The functions' plain TypeScript in `supabase/functions/_shared` (the AI prompt, the Cloudinary code) is unit-tested from `packages/shared`.
6. **Database types match migrations.** After a migration, regenerate `packages/shared/src/db/generated/database.types.ts` (or update it by hand when you cannot reach the project) in the same change.
7. **Money is integer paise**; format with `formatInr`.
8. **No secrets in the app.** Only `EXPO_PUBLIC_*` public values in `apps/mobile` (its `.env.local` included); the service-role key, the YouTube API key, the Cloudinary keys and the Cloudflare token live in Supabase secrets, and on a developer's machine in the git-ignored `supabase/functions/.env`. Secret names are `UPPER_SNAKE_CASE`, prefixed with the service (`CLOUDINARY_API_SECRET`). Never print a key.
9. **Personal data stays out of logs and the on-device cache.** Only `catalog` queries are persisted to disk (`lib/query-persister.ts`); profiles, test attempts and scores never are.
10. **File size.** No code file over **600 lines** (`.ts .tsx .js .jsx .mjs .cjs .css .sql`). See below.
11. **The dev bypass stays dev-only.** `EXPO_PUBLIC_DEV_AUTH_BYPASS` (`src/lib/dev-bypass.ts`) is read only when `__DEV__`; `supabase()` throws `demo_mode` while it is on; `app.config.ts` fails release builds while it is set; demo data lives only in `src/dev/` and the query cache. Keep all four guards. New screens that need data in demo mode get fixtures in `src/dev/`.
12. **The privacy policy says what the app does.** A change to what is collected, stored or shown to others changes `features/legal/privacy-screen.tsx` and its date in the same change.
13. **Pictures go through the functions.** Course covers and banners are stored with `storeImage` (the `upload-image` function) and shown through `fileUrls().mediaUrl`, which asks Cloudinary for the right size. Never upload a picture to Supabase Storage or build a Cloudinary URL by hand. The AI prompt never contains a course's name or description: the model paints any word it is given ([ADR 0012](docs/adr/0012-ai-course-pictures.md)).

## File size (600-line rule)

`pnpm check:file-length` enforces it in CI. Split by responsibility before a file nears the limit:

- Features: `api.ts` (data access), `hooks.ts` (React Query), `screens/*` or `*-screen.tsx` (composition), `components/*` (one component per file).
- Admin: one folder per area (`courses/`, `sections/`, `lessons/`, `tests/`, `people/`, `home-content/`), each with its own api/hooks/screens.
- SQL: one migration per concern; one test file per area.

`scripts/file-length-grandfather.json` lists exceptions (currently none). A listed file may shrink, never grow; remove its entry once it is under the limit, because the check fails on stale entries. Add an entry only with a reason and a backlog story, and only when splitting is genuinely worse. Generated files under `generated/` are exempt.

## Design

Screens are built from `@/ui` and follow [design-system.md](docs/architecture/design-system.md). The short version:

- The things you press are **keys** (`Key`, `Button`, `KeyCap`). One `accent` (marigold) button per screen, for its main action; admin screens use `primary`.
- Rows that belong together sit on one surface (`ListGroup` + `ListRow`), not a card each. Small jobs over a page use `Sheet`, never React Native's `Modal` directly.
- No colours, font sizes or spacing outside `ui/theme.ts`. Both themes must work. Choose a font family from `fonts`; never set `fontWeight` with it.
- First loads show skeletons in the shape of what is coming. Only keys move; no entrance animations.
- Look at what you built: light and dark, a phone's width and a wide screen.

## Code conventions

- TypeScript strict everywhere, `noUncheckedIndexedAccess` on.
- Follow the style of the surrounding code: naming, comment density (comments explain why), error handling.
- The React Compiler is on, and its lint rules with it: no reading refs while rendering, no `setState` straight inside an effect, no `Date.now()` or `Math.random()` while rendering.
- Errors: database functions raise `mcc:<code>`; edge functions return `{ error: { code } }`; the app shows `toAppError(error).message`. Add new codes to `packages/shared/src/errors.ts`.
- Navigation uses `routes` from `@/lib/routes`, never hand-typed paths. Public web pages set their title with `PageTitle` (`@/lib/page-title`).
- UI copy: plain English for Indian students and a non-technical owner, ₹ with Indian grouping, no jargon. Dates and times through `@mcc/shared` (`formatDateTime`, `formatWindow`…), not `toLocaleString`.
- Before using an Expo or React Native API, check the installed version's docs (Expo ships breaking changes every SDK).

## Workflow

1. Pick a story from [docs/BACKLOG.md](docs/BACKLOG.md).
2. Branch: `feat/<area>-<topic>`, `fix/<area>-<topic>`, `docs/<topic>`.
3. Write tests with the code: pure logic in `packages/shared` (vitest), access rules in `supabase/tests`.
4. Verify with `pnpm check`, look at changed screens (see Design), and, for player, upload or test-taking changes, run the manual checklist in [docs/TESTING.md](docs/TESTING.md).

## Claude Code skills that help here

If these are installed, use them: the Expo skills (`expo-router`, `expo-design-system`, `expo-native-ui`) for anything SDK-specific, and `frontend-design` for new screens. Web component catalogues (shadcn, 21st.dev and the like) do not apply to the app's code: they need the browser's DOM and a CSS framework, and these screens are React Native so that one set of components draws both Android and the website ([ADR 0010](docs/adr/0010-design-system-of-keys.md)). Use them for ideas, not for code.
