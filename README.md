# Mishra Computer Centre app

Free computer courses for the students of Mishra Computer Centre, Makhdumpur: YouTube video lessons and PDF notes that open **inside the app**, organised as course → unit → lessons, and managed by the owner from an admin panel in the app or on the web.

|         |                                                                                           |
| ------- | ----------------------------------------------------------------------------------------- |
| App     | Expo SDK 58 (React Native 0.88), Expo Router, TanStack Query, react-hook-form + Zod       |
| Backend | Supabase: Postgres with row-level security, Auth (Google), Storage, Edge Functions (Deno) |
| Video   | YouTube embed in a WebView with a navigation guard; self-hosted player page               |
| PDFs    | react-native-pdf with on-device caching                                                   |
| Tooling | pnpm workspaces, Turborepo, ESLint (with module-boundary rules), Prettier, Vitest         |

## Quick start

```bash
corepack enable                      # once, provides pnpm 12
pnpm install
cp apps/mobile/.env.example apps/mobile/.env.local   # fill in (docs/operations/supabase.md)
pnpm check                           # typecheck, lint, format, file length, tests, DB, functions
pnpm dev:web                         # admin website at http://localhost:8081
```

The phone app uses native modules (Google sign-in, PDF viewer), so it runs in a **development build**, not Expo Go:

```bash
cd apps/mobile
npx eas-cli@latest build --profile development --platform android   # install the APK on the phone
pnpm dev                                                             # then open it from the dev build
```

Without `.env.local` the app opens a setup screen that lists what is missing.

## Try it without a backend (dev bypass)

Set `EXPO_PUBLIC_DEV_AUTH_BYPASS` in `apps/mobile/.env.local` to `student`, `admin` or `owner` and restart Expo (`pnpm dev:web`). The app skips Google sign-in and runs on demo courses, units, videos and PDFs (`apps/mobile/src/dev/`), so every screen can be explored before the Supabase project exists. A red "DEV BYPASS" badge stays on screen.

- Nothing is read from or saved to Supabase: saving shows "Dev bypass is on, so nothing is saved".
- Change role by editing `.env.local` and restarting; a shell variable does not override it on the web.
- Development bundles only. Release builds (`pnpm build:web`, EAS production) refuse to run while it is set: empty it first.

## Where things are

- [CLAUDE.md](CLAUDE.md): rules and conventions (start here).
- [docs/PLAN.md](docs/PLAN.md): what the owner asked for.
- [docs/architecture/overview.md](docs/architecture/overview.md): how it fits together.
- [docs/operations/](docs/operations): setting up Supabase and Google, and releasing to the Play Store.

## Before the first release

The owner's accounts are needed for: the Supabase project, Google Cloud OAuth clients and the YouTube API key, the Expo account, and the Play Console. See [docs/QUESTIONS.md](docs/QUESTIONS.md) and the `OPS-*` stories in [docs/BACKLOG.md](docs/BACKLOG.md).
# mobile-app
