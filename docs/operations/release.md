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

This release adds fonts and a new icon and splash screen, so it needs a **new build** (development builds too); it cannot go out as an over-the-air update.

## Website

```bash
pnpm build:web                      # apps/mobile/dist, a static single-page app
```

Host it as a static site with every address falling back to `index.html` (`vercel.json` does this on Vercel). One address serves everything:

| Address                                          | What                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| `/`                                              | The public home page; the student's Home once signed in                        |
| `/courses`, `/course/<id>`, `/tests`, `/contact` | Public pages; the app's screens once signed in                                 |
| `/privacy`                                       | Privacy policy. **Give this address to Google Play.**                          |
| `/delete-account`                                | How to delete an account. **Google Play's account deletion URL.**              |
| `/sign-in`                                       | Google sign-in for students and staff                                          |
| `/admin`, `/manage/*`                            | The admin panel (staff only)                                                   |
| `/youtube-player.html`                           | The player page the Android app loads; set `EXPO_PUBLIC_PLAYER_PAGE_URL` to it |

After the first deployment:

- [ ] Add the website's address to Supabase → Authentication → URL configuration → Redirect URLs, or sign-in on the website fails.
- [ ] Open `/privacy` and `/delete-account` in a private window on a phone to confirm they load without signing in.
- [ ] Push the database migrations first ([supabase.md](supabase.md), "After pulling new migrations"). Until then the public pages show no courses and the Tests tab shows an error.

## Icon and splash

`apps/mobile/assets/images` holds the store icon (`icon.png`), the Android adaptive icon layers, the splash mark and the favicon: the design system's M key on ink blue ([design-system.md](../architecture/design-system.md)). Replace the pictures, keeping their sizes, when the centre has its own logo (OPS-07); `BRAND_INK` in `app.config.ts` is the colour behind them.

## Play Console checklist

- [ ] Developer account in the owner's name ($25). A new personal account must run **closed testing with at least 12 testers for 14 days** before production.
- [ ] Confirm the Android package name before the first upload: it can never change (OPS-03). `app.config.ts` and the package named in `apps/mobile/.env.example` must agree, and the Google Cloud Android OAuth client must use the same one, or Google sign-in fails in the app.
- [ ] Store listing: name, short and full description, icon (`assets/images/icon.png`, 512 px export), feature graphic, 4–8 screenshots.
- [ ] Privacy policy URL: `https://<website>/privacy`.
- [ ] Account deletion URL: `https://<website>/delete-account`.
- [ ] Data safety. Collected, not shared, encrypted in transit, deletable on request:
  - Personal info: name, email address, phone number (account management; contacting the user).
  - App activity: test answers and scores (app functionality). Mark it as linked to the user.
  - Nothing is used for advertising. YouTube's player may collect viewing data under Google's own policy; the form asks about data _your app_ collects.
- [ ] Content rating questionnaire; target audience 13+.
- [ ] After the first upload: copy the Play App Signing SHA-1 into the Android OAuth client (OPS-09).
- [ ] After publishing: paste the Play Store link in Admin → Centre details (OPS-11). The website then shows "Get the Android app" and "Share the app" sends the link.
- [ ] Run the manual checks in [TESTING.md](../TESTING.md) on the closed-testing build.
