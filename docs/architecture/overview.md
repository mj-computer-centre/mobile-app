# Architecture overview

One Expo codebase builds the Android app and the website. The website is three things at one address: public pages anyone can read, the same student app as on the phone, and the admin panel. All of it talks directly to Supabase; row-level security in Postgres decides what each person may read or change. Edge functions handle what the app must not do itself, because each needs a key that stays secret: calling the YouTube Data API, deleting accounts, keeping pictures on Cloudinary, and drawing course pictures with AI.

```
                ┌──────────────────────────────┐
  Students ───▶ │ Android app (Expo, RN 0.88)  │──┐   reads catalog, takes tests, writes own profile
                └──────────────────────────────┘  │
                ┌──────────────────────────────┐  │   PostgREST + Auth + Storage
  Visitors ───▶ │ Website (same code, Expo web │──┼──────────────────────────────▶ Supabase
  Students ───▶ │ export, static single-page   │  │   (Postgres with RLS, Storage
  Owner/staff ─▶│ app): public pages, student  │  │    bucket `notes` for the PDFs)
                │ app, admin panel             │  │
                └──────────────────────────────┘  ▼
                              │ youtube-meta   Edge functions (Deno) ──▶ YouTube Data API v3
                              ├──────────────▶ delete-account ─────────▶ Supabase Auth admin
                              ├──────────────▶ upload-image, remove-images ─▶ Cloudinary
                              └──────────────▶ course-image ───────────▶ Cloudflare Workers AI

  Video playback: app WebView ──▶ our player page (on the website) ──▶ YouTube iframe embed
  Pictures:       app ──▶ Cloudinary's CDN (course covers and banners, resized on the way)
```

## Pictures

Course covers and home banners are kept on Cloudinary, not in Supabase Storage ([ADR 0011](../adr/0011-pictures-on-cloudinary.md)).

- **Storing.** Staff choose a picture; the app sends its bytes to the `upload-image` function, which checks the caller is staff, checks the size and the file's first bytes, and uploads it to Cloudinary with a signed request. The function answers with the picture's URL, and the app saves that URL on the course (`courses.thumbnail_path`) or banner (`banners.image_path`) under the usual row-level security. The Cloudinary keys exist only in the functions' secrets.
- **Showing.** `sizedImageUrl` (`packages/shared/src/images`) turns the stored URL into the one the app loads: cropped to 16:9 from the centre, at one of two widths, in the smallest format the device accepts. A cover is 15 to 30 KB. Pictures from before Cloudinary are paths in the old `media` bucket and are still shown from there.
- **Removing.** When a cover is replaced or a banner deleted, the app asks `remove-images` to delete the old picture. The function only removes pictures in this app's Cloudinary folder that no course or banner still uses.
- **AI covers.** **Make one with AI** asks the `course-image` function for four pictures, one request each ([ADR 0012](../adr/0012-ai-course-pictures.md)). The function draws them with FLUX.1 [schnell] on Cloudflare Workers AI and returns them without storing anything; the one the admin chooses is stored like an uploaded picture. The course's name and description are never sent to the model: they only choose what to draw (`supabase/functions/_shared/cover-prompt.ts`).

## Modules

| Layer          | Path                  | Depends on                                  | Notes                                                                                                        |
| -------------- | --------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Domain         | `packages/shared`     | Zod only                                    | Types, form schemas, mappers, YouTube parsing, navigation policy, test status and import, dates, money, CSV. |
| Routes         | `apps/mobile/src/app` | features                                    | Thin: each route renders one feature screen. Access gate in `_layout.tsx`.                                   |
| App shell      | `src/app-shell`       | features, lib, ui                           | Providers (query cache, auth, navigation theme), fonts, the three navigation bars, setup screen.             |
| Features       | `src/features/*`      | lib, ui, shared, other features' `index.ts` | auth, profile, catalog, player, notes, tests, contact, home, site, legal, admin.                             |
| Infrastructure | `src/lib`             | shared                                      | env, Supabase client, data helpers, query client and persistence, routes, page titles, platform helpers.     |
| Design system  | `src/ui`              | shared (types and formatters)               | Tokens and components. See [design-system.md](design-system.md).                                             |

### Module boundaries

ESLint enforces these (`eslint.config.mjs`):

- A feature is imported only through its `index.ts` (`@/features/catalog`, never `@/features/catalog/api`).
- `ui/` imports neither features nor `lib/`; `lib/` imports neither features nor `ui/`.
- `@mcc/shared` imports no React, Expo, Supabase or TanStack code, so it runs anywhere.
- `import/no-cycle` forbids circular imports.

Feature dependencies flow one way:

```
auth    ◀─ profile ◀─ home
auth    ◀─ tests, catalog, site, legal, admin   (who is signed in, and whether they are staff)
tests   ◀─ catalog ◀─ profile, player, notes, home, site, admin
contact ◀─ profile, home, site, legal, admin
site    ◀─ legal        (the public website; only routes and the legal pages use it)
```

`admin` depends on everything it edits; nothing depends on `admin`.

### Inside a feature

```
features/<name>/
  index.ts          public API
  api.ts            data access: Supabase queries → domain models (via @mcc/shared mappers)
  hooks.ts          React Query hooks and query keys
  components/       one component per file
  screens/          composition of components and hooks
```

The admin feature has one folder per area (`courses/`, `sections/`, `lessons/`, `tests/`, `people/`, `home-content/`, `library/`, `dashboard/`, `shared/`), each following the same shape.

## Data flow

- **Reads**: hooks call `api.ts`, which runs typed Supabase queries through `run()` (throws `AppError`) and maps rows with `@mcc/shared` mappers. Course detail is two round trips: the nested course tree, then the notes PDFs its videos point to.
- **Writes**: mutations call `api.ts`; on success they invalidate the query keys of what staff see and what students see (`useRefreshContent`, `useRefreshTests`) so edits show at once.
- **Ordering**: positions are changed only by database functions that lock the parent row and keep positions gap-free.
- **Tests**: the clock, the one-attempt rule and marking are in the database; the app shows them. See [tests.md](tests.md).
- **Offline**: successful `catalog` queries are persisted on the phone for a week (expo-sqlite key-value store); PDFs are cached by react-native-pdf. Admin data, profiles and test results are never persisted.
- **Errors**: one vocabulary of codes (`packages/shared/src/errors.ts`) across database (`mcc:<code>`), edge functions (`{ error: { code } }`) and UI.

## Access gate

`src/app/_layout.tsx` derives one state from the session, the profile and the staff row (`useAccess`):

| State         | On the phone                                                  | On the website                                                      |
| ------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| loading       | splash                                                        | the M mark                                                          |
| signed-out    | sign-in                                                       | the public pages: home, courses, a course's outline, tests, contact |
| needs-profile | complete-profile                                              | complete-profile                                                    |
| ready         | tabs, course, lesson, notes, tests; plus `manage/*` for staff | the same                                                            |

Privacy policy and account-deletion pages are always reachable (Google Play needs public URLs). The same rules are enforced again by row-level security: what a signed-out visitor can read is exactly what the `anon` policies and the `public_*` functions allow ([data-model.md](data-model.md)).

One set of routes serves both a visitor and someone signed in: `/`, `/courses`, `/tests`, `/contact` and `/course/<id>` render the public page or the app screen by state (`useIsSignedIn`). The public pages live in `features/site`.

## The website

- A single-page app (`web.output: 'single'`): the host serves `public/index.html` for every address (`vercel.json`). The page shows the M mark until the bundle has loaded.
- Each page sets its browser title and description when it is in view (`lib/page-title.tsx`, Expo Router's `Head`).
- Pre-rendering the public pages to HTML at build time (for search engines and slow phones) is not done; see backlog WEB-06 and [ADR 0008](../adr/0008-public-website-in-the-same-app.md).

## Platform splits

Files with a `.web.tsx`/`.web.ts` twin: `lesson-player` (plain iframe on the web), `pdf-viewer` (browser viewer), `google-sign-in` (OAuth redirect), `auth-storage`, `confirm`, `save-text-file`, `query-persister`.
