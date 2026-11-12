# Architecture overview

One Expo codebase builds the Android app and the admin website. Both talk directly to Supabase; row-level security in Postgres decides what each person may read or change. Two edge functions handle what the app must not do itself: calling the YouTube Data API (the key stays secret) and deleting accounts (needs the service role).

```
                ┌──────────────────────────────┐
  Students ───▶ │ Android app (Expo, RN 0.88)  │──┐   reads catalog, writes own profile
                └──────────────────────────────┘  │
                ┌──────────────────────────────┐  │   PostgREST + Auth + Storage
  Owner/staff ─▶│ Admin website (same code,    │──┼──────────────────────────────▶ Supabase
                │ Expo web export, static SPA) │  │   (Postgres with RLS, Storage
                └──────────────────────────────┘  │    buckets `notes` and `media`)
                              │                   │
                              │ youtube-meta      ▼
                              └────────▶ Edge functions (Deno) ──▶ YouTube Data API v3
                                         delete-account ──────────▶ Supabase Auth admin

  Video playback: app WebView ──▶ our player page (admin website) ──▶ YouTube iframe embed
```

## Modules

| Layer          | Path                  | Depends on                                  | Notes                                                                                       |
| -------------- | --------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Domain         | `packages/shared`     | Zod only                                    | Types, form schemas, mappers, YouTube parsing, navigation policy, money, CSV. Unit-tested.  |
| Routes         | `apps/mobile/src/app` | features                                    | Thin: each route renders one feature screen. Access gate in `_layout.tsx`.                  |
| App shell      | `src/app-shell`       | features, lib, ui                           | Providers (query cache, auth, navigation theme), setup screen.                              |
| Features       | `src/features/*`      | lib, ui, shared, other features' `index.ts` | auth, profile, catalog, player, notes, contact, home, legal, admin.                         |
| Infrastructure | `src/lib`             | shared                                      | env, Supabase client, data helpers, query client and persistence, routes, platform helpers. |
| Design system  | `src/ui`              | shared (types only)                         | Tokens and small components.                                                                |

### Module boundaries

ESLint enforces these (`eslint.config.mjs`):

- A feature is imported only through its `index.ts` (`@/features/catalog`, never `@/features/catalog/api`).
- `ui/` imports neither features nor `lib/`; `lib/` imports neither features nor `ui/`.
- `@mcc/shared` imports no React, Expo, Supabase or TanStack code, so it runs anywhere.
- `import/no-cycle` forbids circular imports.

Feature dependencies flow one way: `auth ← profile ← home`, `catalog ← player, notes, home, admin`, `contact ← admin`. `admin` depends on everything it edits; nothing depends on `admin`.

### Inside a feature

```
features/<name>/
  index.ts          public API
  api.ts            data access: Supabase queries → domain models (via @mcc/shared mappers)
  hooks.ts          React Query hooks and query keys
  components/       one component per file
  screens/          composition of components and hooks
```

The admin feature has one folder per area (`courses/`, `sections/`, `lessons/`, `people/`, `home-content/`, `library/`, `dashboard/`, `shared/`), each following the same shape.

## Data flow

- **Reads**: hooks call `api.ts`, which runs typed Supabase queries through `run()` (throws `AppError`) and maps rows with `@mcc/shared` mappers. Course detail is two round trips: the nested course tree, then the notes PDFs its videos point to.
- **Writes**: mutations call `api.ts`; on success they invalidate both `admin` and `catalog` query keys (`useRefreshContent`) so edits show at once.
- **Ordering**: positions are changed only by database functions that lock the parent row and keep positions gap-free.
- **Offline**: successful `catalog` queries are persisted on the phone for a week (expo-sqlite key-value store); PDFs are cached by react-native-pdf. Admin and personal data are never persisted.
- **Errors**: one vocabulary of codes (`packages/shared/src/errors.ts`) across database (`mcc:<code>`), edge functions (`{ error: { code } }`) and UI.

## Access gate

`src/app/_layout.tsx` derives one state from the session, the profile and the staff row (`useAccess`):

| State         | Screens                                                |
| ------------- | ------------------------------------------------------ |
| loading       | splash                                                 |
| signed-out    | sign-in                                                |
| needs-profile | complete-profile                                       |
| ready         | tabs, course, lesson, notes; plus `manage/*` for staff |

Privacy policy and account-deletion pages are always reachable (Google Play needs public URLs). The same rules are enforced again by row-level security.

## Platform splits

Files with a `.web.tsx`/`.web.ts` twin: `lesson-player` (plain iframe on the web), `pdf-viewer` (browser viewer), `google-sign-in` (OAuth redirect), `auth-storage`, `confirm`, `save-text-file`, `query-persister`.
