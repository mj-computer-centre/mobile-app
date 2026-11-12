# Builds and Play Store release

## Build profiles (`apps/mobile/eas.json`)

| Profile       | What                                                                              | Install |
| ------------- | --------------------------------------------------------------------------------- | ------- |
| `development` | Dev client, separate package (`….dev`, "MCC Dev") so it sits beside the store app | APK     |
| `preview`     | Production-like APK for testers outside the Play Store                            | APK     |
| `production`  | App bundle for the Play Store; version code auto-increments                       | AAB     |

```bash
cd apps/mobile
npx eas-cli@latest login            # the centre's Expo account
npx eas-cli@latest init             # once: links the project, sets EAS_PROJECT_ID
npx eas-cli@latest env:create       # EXPO_PUBLIC_* values for each environment
npx eas-cli@latest build --profile production --platform android
npx eas-cli@latest submit --profile production --platform android
```

## Admin website

```bash
pnpm build:web                      # apps/mobile/dist, a static single-page app
```

Host on Cloudflare Pages or EAS Hosting with "single-page app" fallback to `index.html`. The site also serves `/youtube-player.html` (set `EXPO_PUBLIC_PLAYER_PAGE_URL` to it), `/privacy` and `/delete-account`.

## Play Console checklist

- [ ] Developer account in the owner's name ($25). A new personal account must run **closed testing with at least 12 testers for 14 days** before production.
- [ ] Store listing: name, short and full description, icon, feature graphic, 4–8 screenshots.
- [ ] Privacy policy URL: `https://<admin site>/privacy`.
- [ ] Account deletion URL: `https://<admin site>/delete-account`.
- [ ] Data safety: collects name, email, phone (account management; contacting the user); not shared; encrypted in transit; users can request deletion.
- [ ] Content rating questionnaire; target audience 13+.
- [ ] After the first upload: copy the Play App Signing SHA-1 into the Android OAuth client (OPS-09).
- [ ] Run the manual checks in [TESTING.md](../TESTING.md) on the closed-testing build.
