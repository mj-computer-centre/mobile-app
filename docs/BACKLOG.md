# Backlog

Status: `done` (built and verified by `pnpm check`), `todo`, `blocked` (needs the owner).

## Foundation (FND)

| ID     | Story                                                                                  | Status |
| ------ | -------------------------------------------------------------------------------------- | ------ |
| FND-01 | Monorepo (pnpm, Turborepo), TypeScript strict, ESLint with module boundaries, Prettier | done   |
| FND-02 | 600-line file check with grandfather list, in CI                                       | done   |
| FND-03 | Database schema, row-level security, ordering functions, storage buckets               | done   |
| FND-04 | SQL access-rule tests on a throwaway Postgres (`pnpm db:verify`)                       | done   |
| FND-05 | Shared domain package with unit tests                                                  | done   |
| FND-06 | Edge functions `youtube-meta` and `delete-account`, deno-checked                       | done   |
| FND-07 | CI workflow (typecheck, lint, format, file length, tests, DB, functions, web build)    | done   |

## Student app (STU)

| ID     | Story                                                                                       | Status |
| ------ | ------------------------------------------------------------------------------------------- | ------ |
| STU-01 | Google sign-in (native) and Supabase OAuth (web)                                            | done   |
| STU-02 | One-time profile form: name, mobile, village/town, course of interest                       | done   |
| STU-03 | Home: greeting, banners, course row                                                         | done   |
| STU-04 | Courses list with ₹0 / crossed-out price / % off                                            | done   |
| STU-05 | Course page: about points, units (Unit N – title), lessons                                  | done   |
| STU-06 | In-app YouTube player with navigation guard, next video, Up next card, full-screen rotation | done   |
| STU-07 | In-app PDF viewer with on-device cache                                                      | done   |
| STU-08 | Catalog cached on the device for offline reopening                                          | done   |
| STU-09 | Contact tab from editable settings                                                          | done   |
| STU-10 | Profile: edit, share app, privacy policy, sign out, delete account                          | done   |
| STU-11 | Public privacy policy and account-deletion pages                                            | done   |

## Admin (ADM)

| ID     | Story                                                              | Status |
| ------ | ------------------------------------------------------------------ | ------ |
| ADM-01 | Admin tab and website, staff-only                                  | done   |
| ADM-02 | Dashboard: students, new this week, live courses, lessons          | done   |
| ADM-03 | Courses: create, edit, cover picture, publish, reorder, delete     | done   |
| ADM-04 | Units in a course: add new, add existing (shared), reorder, remove | done   |
| ADM-05 | Unit editor: rename, lessons reorder/remove, add from library      | done   |
| ADM-06 | Add YouTube video or whole playlist, with playability warnings     | done   |
| ADM-07 | Upload unit-wise PDFs; attach topic-wise notes to a video          | done   |
| ADM-08 | Library: units and lessons with usage counts, rename, delete       | done   |
| ADM-09 | Students list, search, call, CSV export for Excel                  | done   |
| ADM-10 | Home banners: add, show/hide, link to course, reorder, delete      | done   |
| ADM-11 | Contact details form                                               | done   |
| ADM-12 | Staff management (owner only)                                      | done   |

## Operations (OPS) — needs the owner

| ID     | Story                                                                                           | Status  |
| ------ | ----------------------------------------------------------------------------------------------- | ------- |
| OPS-01 | Create the Supabase dev and production projects; push migrations; deploy functions; set secrets | blocked |
| OPS-02 | Google Cloud: OAuth consent screen, Web/Android client ids, YouTube Data API key                | blocked |
| OPS-03 | Choose the Android package name (permanent once published); update `app.config.ts`              | blocked |
| OPS-04 | Play Console account, store listing, Data safety form, account-deletion URL                     | blocked |
| OPS-05 | Deploy the admin website (Cloudflare Pages or EAS Hosting); set `EXPO_PUBLIC_PLAYER_PAGE_URL`   | todo    |
| OPS-06 | Owner reviews the privacy policy text                                                           | blocked |
| OPS-07 | Logo, app icon, splash and brand colours (theme tokens)                                         | blocked |
| OPS-08 | Closed testing with 12+ testers for 14 days, then production                                    | blocked |
| OPS-09 | Add the Play App Signing SHA-1 to the Android OAuth client after the first upload               | todo    |

## Testing (TST)

| ID     | Story                                                                                            | Status |
| ------ | ------------------------------------------------------------------------------------------------ | ------ |
| TST-01 | Component tests (jest-expo + Testing Library) for the access gate and admin forms                | todo   |
| TST-02 | No-exit checklist on 2–3 real Android phones, including a low-end one                            | todo   |
| TST-03 | End-to-end run against the dev project: sign in, add playlist, watch, open notes, delete account | todo   |

## After launch (LTR)

| ID     | Story                                        | Status |
| ------ | -------------------------------------------- | ------ |
| LTR-01 | Push notification when a new lesson is added | todo   |
| LTR-02 | Continue watching and progress tracking      | todo   |
| LTR-03 | Search across courses and lessons            | todo   |
| LTR-04 | Hindi / English switch                       | todo   |
| LTR-05 | Certified students gallery                   | todo   |
| LTR-06 | Topic quizzes and typing test                | todo   |
| LTR-07 | Recently added lessons on Home               | todo   |

## Paid courses (PAY)

| ID     | Story                                                                        | Status |
| ------ | ---------------------------------------------------------------------------- | ------ |
| PAY-01 | Enrolments; visibility helpers check enrolment for paid courses              | todo   |
| PAY-02 | Private video hosting for paid videos (Unlisted YouTube links can be shared) | todo   |
| PAY-03 | Private notes bucket with signed URLs for paid courses                       | todo   |
| PAY-04 | Payment flow that follows Google Play's billing rules                        | todo   |
| PAY-05 | One phone per account; screenshot blocking                                   | todo   |
