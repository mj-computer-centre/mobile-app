# Setting up Supabase, Google sign-in and the YouTube API

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

## 2. Google sign-in

1. Google Cloud console → new project → OAuth consent screen (External; app name, support email, privacy policy URL `https://<admin site>/privacy`).
2. Credentials → OAuth client IDs:
   - **Web application**: authorised redirect URI `https://<ref>.supabase.co/auth/v1/callback`. Its client id is `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
   - **Android** (one per signing key): package name from `app.config.ts` and the SHA-1 of the debug/EAS key; after the first Play upload add the **Play App Signing** SHA-1 too (OPS-09), or sign-in fails only in the store build.
3. Supabase → Authentication → Providers → Google: enable; paste the web client id and secret; add the Android client id to "Authorized Client IDs".
4. Supabase → Authentication → URL configuration: add the admin website's URL (and `http://localhost:8081` for development) to redirect URLs.

## 3. YouTube Data API

Google Cloud → APIs → enable **YouTube Data API v3** → create an API key restricted to that API. Then:

```bash
pnpm dlx supabase secrets set YOUTUBE_API_KEY=<key>
```

## 4. Edge functions

```bash
pnpm functions:check
pnpm dlx supabase functions deploy youtube-meta --use-api
pnpm dlx supabase functions deploy delete-account --use-api
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are provided to functions automatically.

## 5. First owner

The owner signs in to the app once (creating their account), then in the SQL editor:

```sql
select private.bootstrap_owner('centre@gmail.com');
```

From then on the owner adds staff in Admin → Staff.

## 6. App configuration

`apps/mobile/.env.local` (development) and EAS environment variables (builds): see `apps/mobile/.env.example`.

## Free-plan notes

- Projects pause after a week without activity; resume from the dashboard (only matters during development).
- About 5 GB of uncached bandwidth a month: PDFs are cached on phones after the first open.
- Never put the service-role key in the app or in `EXPO_PUBLIC_*` variables.
