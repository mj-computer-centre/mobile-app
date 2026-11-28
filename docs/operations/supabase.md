# Setting up Supabase, Google sign-in, the YouTube API and pictures

Everything is created on the **centre's Gmail account**; the developer is invited as a member. Use two Supabase projects: `mcc-dev` and `mcc-prod`.

## 1. Supabase project

1. Create the project (region: Mumbai). Note the project ref, URL and publishable key (Project settings → API).
2. Link and push the schema:
   ```bash
   pnpm dlx supabase login
   pnpm dlx supabase link --project-ref <ref>
   pnpm dlx supabase db push            # applies supabase/migrations
   ```
3. Dev project only: run `supabase/seed.sql` in the SQL editor for demo courses.
4. Regenerate types and commit them:
   ```bash
   pnpm dlx supabase gen types typescript --project-id <ref> --schema public > packages/shared/src/db/generated/database.types.ts
   ```

### After pulling new migrations

Whenever `supabase/migrations` gains files (28 Nov 2026 added five: tests, their access rules, their admin functions, the public website, and the daily limit for AI pictures), each project needs them before the matching app or website is released:

```bash
pnpm db:verify                       # applies everything to a throwaway local Postgres and runs the tests
pnpm dlx supabase link --project-ref <ref>
pnpm dlx supabase db push            # dev first, then production
pnpm dlx supabase gen types typescript --project-id <ref> --schema public > packages/shared/src/db/generated/database.types.ts
pnpm typecheck                       # the generated types must still fit the app
```

The `20261128000400_public_site` migration lets visitors who have not signed in read **published course names, descriptions, prices and outlines** (unit and lesson titles) and the names and times of tests. It gives them nothing that plays. Read it before pushing if the centre would rather keep any of that private.

## 2. Google sign-in

1. Google Cloud console → new project → OAuth consent screen (External; app name, support email, privacy policy URL `https://<website>/privacy`).
2. Credentials → OAuth client IDs:
   - **Web application**: authorised redirect URI `https://<ref>.supabase.co/auth/v1/callback`. Its client id is `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
   - **Android** (one per signing key): package name from `app.config.ts` and the SHA-1 of the debug/EAS key; after the first Play upload add the **Play App Signing** SHA-1 too (OPS-09), or sign-in fails only in the store build.
3. Supabase → Authentication → Providers → Google: enable; paste the web client id and secret; add the Android client id to "Authorized Client IDs".
4. Supabase → Authentication → URL configuration: add the website's URL (and `http://localhost:8081` for development) to redirect URLs. Students sign in on the website too, not only staff.

## 3. YouTube Data API

Google Cloud → APIs → enable **YouTube Data API v3** → create an API key restricted to that API. Then:

```bash
pnpm dlx supabase secrets set YOUTUBE_API_KEY=<key>
```

## 4. Pictures: Cloudinary and Cloudflare

Course covers and home banners are kept on **Cloudinary**. The **Make one with AI** button draws course covers with **Cloudflare Workers AI**. Both are free at the centre's size, and both are used only from edge functions: their keys are function secrets and never go in the app ([ADR 0011](../adr/0011-pictures-on-cloudinary.md), [ADR 0012](../adr/0012-ai-course-pictures.md)).

1. **Cloudinary**: sign up at cloudinary.com with the centre's Gmail. Dashboard → **API Keys** shows the cloud name, the API key and the API secret.
2. **Cloudflare**: dash.cloudflare.com → Workers AI → **Use REST API** shows the Account ID and has **Create a Workers AI API Token**.
3. Copy `supabase/functions/.env.example` to `supabase/functions/.env` (git-ignored) and fill it in:

   | Name                    | What                                                                                                                            |
   | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
   | `CLOUDINARY_CLOUD_NAME` | The account's cloud name. It is part of every picture's address, so it is not secret.                                           |
   | `CLOUDINARY_API_KEY`    | Names the account in an upload.                                                                                                 |
   | `CLOUDINARY_API_SECRET` | Signs uploads and removals. **Secret.**                                                                                         |
   | `CLOUDINARY_FOLDER`     | The app's own folder in the account (`mishra-computer-centre`). Covers go to `<folder>/courses`, banners to `<folder>/banners`. |
   | `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account that draws the pictures.                                                                                 |
   | `CLOUDFLARE_AI_TOKEN`   | A Workers AI API token for that account. **Secret.**                                                                            |

4. Check them. This draws one picture, stores it on Cloudinary, loads it back as a cover and removes it again. It never prints a key:
   ```bash
   pnpm images:verify
   ```
5. Send them to each Supabase project (dev, then production), and deploy the functions (next section):
   ```bash
   pnpm dlx supabase secrets set --env-file supabase/functions/.env
   ```

Until the secrets are set and the functions deployed, the app says "Pictures cannot be saved yet" when staff add a picture, and "AI pictures are not switched on yet" for AI. Everything else works.

Pictures uploaded before 28 Nov 2026 are in the Supabase Storage bucket `media`. They keep working; replacing one moves that course or banner to Cloudinary.

## 5. Edge functions

```bash
pnpm functions:check
pnpm dlx supabase functions deploy youtube-meta --use-api
pnpm dlx supabase functions deploy delete-account --use-api
pnpm dlx supabase functions deploy course-image --use-api
pnpm dlx supabase functions deploy upload-image --use-api
pnpm dlx supabase functions deploy remove-images --use-api
```

| Function         | What it does                                                         | Secrets it needs  |
| ---------------- | -------------------------------------------------------------------- | ----------------- |
| `youtube-meta`   | Title, length and thumbnail of a video or playlist                   | `YOUTUBE_API_KEY` |
| `delete-account` | Deletes the caller's account                                         | none              |
| `course-image`   | Draws one AI picture for a course cover (staff only, 40 a day)       | `CLOUDFLARE_*`    |
| `upload-image`   | Stores a course cover or banner on Cloudinary (staff only)           | `CLOUDINARY_*`    |
| `remove-images`  | Removes pictures nothing shows any more from Cloudinary (staff only) | `CLOUDINARY_*`    |

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are provided to functions automatically.

## 6. First owner

The owner signs in to the app once (creating their account), then in the SQL editor:

```sql
select private.bootstrap_owner('centre@gmail.com');
```

From then on the owner adds staff in Admin → Staff.

## 7. App configuration

`apps/mobile/.env.local` (development) and EAS environment variables (builds): see `apps/mobile/.env.example`. Only public `EXPO_PUBLIC_*` values go there; the keys in sections 3 and 4 never do.

## Free-plan notes

- Projects pause after a week without activity; resume from the dashboard (only matters during development).
- About 5 GB of uncached bandwidth a month: PDFs are cached on phones after the first open.
- Never put the service-role key, the Cloudinary secret or the Cloudflare token in the app or in `EXPO_PUBLIC_*` variables.
- Cloudinary's free plan gives 25 credits a month (a credit is 1 GB kept, 1 GB sent, or 1,000 resized pictures; check cloudinary.com/pricing). A cover is sent at 15 to 30 KB, so this is far more than the centre needs.
- Cloudflare gives each account 10,000 "neurons" a day free. A picture costs about 173 (measured: a new account ran out after 58 pictures), so the free allowance is about 57 pictures a day, and it starts again at midnight UTC (5:30 am in India). The app stops at 40 AI pictures a day (10 presses of **Make 4 pictures**), about 6,900 neurons, counted in the database (`use_ai_image_allowance`). On the free plan Cloudflare refuses further pictures rather than charging; `pnpm images:verify` also draws one each time it runs.
