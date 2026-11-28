# Mishra Computer Centre app

Computer courses for the students of Mishra Computer Centre, Makhdumpur: YouTube video lessons and PDF notes that open **inside the app**, organised as course → unit → lessons, with **timed tests**, all managed by the owner from an admin panel in the app or on the web. The same code is the centre's **public website**: anyone can read what it teaches, and students can sign in there too.

|          |                                                                                            |
| -------- | ------------------------------------------------------------------------------------------ |
| App      | Expo SDK 58 (React Native 0.88), Expo Router, TanStack Query, react-hook-form + Zod        |
| Website  | The same app exported for the web: public pages, the student app, the admin panel          |
| Tests    | Timed multiple-choice tests; the clock, the one-attempt rule and marking are in Postgres   |
| Design   | Its own design system of "keys" (`apps/mobile/src/ui`), light and dark, Anek Latin         |
| Backend  | Supabase: Postgres with row-level security, Auth (Google), Storage, Edge Functions (Deno)  |
| Video    | YouTube embed in a WebView with a navigation guard; self-hosted player page                |
| PDFs     | react-native-pdf with on-device caching                                                    |
| Pictures | Course covers and banners on Cloudinary; covers can be drawn by AI (Cloudflare Workers AI) |
| Tooling  | pnpm workspaces, Turborepo, ESLint (with module-boundary rules), Prettier, Vitest          |

## Quick start

```bash
corepack enable                      # once, provides pnpm 12
pnpm install
cp apps/mobile/.env.example apps/mobile/.env.local   # fill in (docs/operations/supabase.md)
pnpm check                           # typecheck, lint, format, file length, tests, DB, functions
pnpm dev:web                         # the website at http://localhost:8081
```

Pictures need two more sets of keys, which belong to the edge functions and never to the app:

```bash
cp supabase/functions/.env.example supabase/functions/.env    # Cloudinary and Cloudflare keys
pnpm images:verify                   # proves both sets work, with real requests; prints no key
```

The phone app uses native modules (Google sign-in, PDF viewer), so it runs in a **development build**, not Expo Go:

```bash
cd apps/mobile
npx eas-cli@latest build --profile development --platform android   # install the APK on the phone
pnpm dev                                                             # then open it from the dev build
```

Without `.env.local` the app opens a setup screen that lists what is missing.

## Try it without a backend (dev bypass)

Set `EXPO_PUBLIC_DEV_AUTH_BYPASS` in `apps/mobile/.env.local` to `visitor`, `student`, `admin` or `owner` and restart Expo (`pnpm dev:web`). The app skips Google sign-in and runs on demo courses, units, videos, PDFs and tests (`apps/mobile/src/dev/`), so every screen can be explored without a backend. `visitor` shows the public website as someone who has not signed in sees it. A red "DEV BYPASS" badge stays on screen.

The demo tests are timed from the moment the page loads: one is open, one is being taken (its clock is running), one is coming up, one was missed and can be taken late, and one is finished with a score, a rank and answers to review.

- Nothing is read from or saved to Supabase: saving shows "Dev bypass is on, so nothing is saved".
- Change role by editing `.env.local` and restarting; a shell variable does not override it on the web.
- Development bundles only. Release builds (`pnpm build:web`, EAS production) refuse to run while it is set: empty it first.

## Where things are

- [CLAUDE.md](CLAUDE.md): rules and conventions (start here).
- [docs/PLAN.md](docs/PLAN.md): what the owner asked for.
- [docs/architecture/overview.md](docs/architecture/overview.md): how it fits together.
- [docs/architecture/design-system.md](docs/architecture/design-system.md): the look, and the rules that keep it.
- [docs/architecture/tests.md](docs/architecture/tests.md): how tests behave.
- [docs/operations/](docs/operations): setting up Supabase and Google, and releasing to the Play Store.

## Before the first release

The owner's accounts are needed for: the Supabase project, Google Cloud OAuth clients and the YouTube API key, Cloudinary (pictures) and Cloudflare (AI pictures), the Expo account, and the Play Console. Before the matching build goes out, each Supabase project needs the newest database migrations, the function secrets and the five edge functions ([docs/operations/supabase.md](docs/operations/supabase.md)). See [docs/QUESTIONS.md](docs/QUESTIONS.md) and the `OPS-*` stories in [docs/BACKLOG.md](docs/BACKLOG.md).
