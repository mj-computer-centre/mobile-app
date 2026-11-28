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
| STU-03 | Home: greeting, next test, banners, course row, call and WhatsApp keys                      | done   |
| STU-04 | Courses list with ₹0 / crossed-out price / % off                                            | done   |
| STU-05 | Course page: about points, units (Unit N – title), lessons, the course's tests              | done   |
| STU-06 | In-app YouTube player with navigation guard, next video, Up next card, full-screen rotation | done   |
| STU-07 | In-app PDF viewer with on-device cache                                                      | done   |
| STU-08 | Catalog cached on the device for offline reopening                                          | done   |
| STU-09 | Contact tab from editable settings                                                          | done   |
| STU-10 | Profile: edit, share app, privacy policy, sign out, delete account                          | done   |
| STU-11 | Public privacy policy and account-deletion pages                                            | done   |

## Tests (TEST)

How tests behave: [architecture/tests.md](architecture/tests.md).

| ID      | Story                                                                                             | Status |
| ------- | ------------------------------------------------------------------------------------------------- | ------ |
| TEST-01 | Tables, access rules and functions: window, deadline, one attempt, late attempts, computed scores | done   |
| TEST-02 | Tests tab: open now, coming up, missed but still open, past                                       | done   |
| TEST-03 | A test's page: rules before starting, start, continue, result with score and rank                 | done   |
| TEST-04 | Taking a test: clock from the server, answers saved as chosen, question grid, auto-submit         | done   |
| TEST-05 | Seeing the answers after the test closes, with the centre's explanations                          | done   |
| TEST-06 | Admin: create and edit tests, questions one by one or pasted in bulk, reorder                     | done   |
| TEST-07 | Admin: results, download for Excel, one student's answers, let a student take it again            | done   |
| TEST-08 | Admin: "Let students who missed it take it later" switch                                          | done   |
| TEST-09 | Notification when a test opens (with LTR-01)                                                      | todo   |
| TEST-10 | Pictures in questions                                                                             | todo   |
| TEST-11 | Shuffle questions and options per student                                                         | todo   |
| TEST-12 | Tests only for the students of one course (needs enrolments, PAY-01)                              | todo   |
| TEST-13 | Typing test                                                                                       | todo   |

## Public website (WEB)

| ID     | Story                                                                                          | Status |
| ------ | ---------------------------------------------------------------------------------------------- | ------ |
| WEB-01 | Visitors can read published courses and outlines; `public_*` functions; SQL tests              | done   |
| WEB-02 | Home page: course keyboard, real counts, courses, how it works, coming tests, visit the centre | done   |
| WEB-03 | Public courses list, course outline, tests and contact pages                                   | done   |
| WEB-04 | Top bar, footer with Privacy policy and Delete your account, page titles and descriptions      | done   |
| WEB-05 | "Get the Android app" button from the Play Store link in Admin → Centre details                | done   |
| WEB-06 | Pre-render the public pages to HTML at build time (needs CSS-driven layouts; ADR 0008)         | todo   |
| WEB-07 | Sitemap, and a share picture for links pasted into WhatsApp                                    | todo   |

## Design (DSN)

| ID     | Story                                                                                                         | Status |
| ------ | ------------------------------------------------------------------------------------------------------------- | ------ |
| DSN-01 | Design system of keys: tokens, Anek Latin, light and dark ([design-system.md](architecture/design-system.md)) | done   |
| DSN-02 | Every student, admin and public screen rebuilt on it                                                          | done   |
| DSN-03 | App icon, adaptive icon, splash mark and favicon (the M key)                                                  | done   |
| DSN-04 | Check the new look on 2–3 real Android phones, including a low-end one (with TST-02)                          | todo   |

## Admin (ADM)

| ID     | Story                                                                                                                                                                  | Status |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| ADM-01 | Admin tab and website, staff-only                                                                                                                                      | done   |
| ADM-02 | Dashboard: students, new this week, live courses, lessons, tests                                                                                                       | done   |
| ADM-03 | Courses: create, edit, cover picture, publish, reorder, delete                                                                                                         | done   |
| ADM-04 | Units in a course: add new, add existing (shared), reorder, remove                                                                                                     | done   |
| ADM-05 | Unit editor: rename, lessons reorder/remove, add from library                                                                                                          | done   |
| ADM-06 | Add YouTube video or whole playlist, with playability warnings                                                                                                         | done   |
| ADM-07 | Upload unit-wise PDFs; attach topic-wise notes to a video                                                                                                              | done   |
| ADM-08 | Library: units and lessons with usage counts, rename, delete                                                                                                           | done   |
| ADM-09 | Students list, search, call, CSV export for Excel                                                                                                                      | done   |
| ADM-10 | Home banners: add, show/hide, link to course, reorder, delete                                                                                                          | done   |
| ADM-11 | Centre details form, with the Play Store link                                                                                                                          | done   |
| ADM-12 | Staff management (owner only)                                                                                                                                          | done   |
| ADM-13 | Staff shortcuts on the pages students see: New course on Courses (with drafts shown), Edit on a course, New test and Manage tests on Tests, Edit and Results on a test | done   |

## Pictures (IMG)

| ID     | Story                                                                                                                                                                                       | Status |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| IMG-01 | Course covers and banners kept on Cloudinary: `upload-image` and `remove-images` functions, signed requests, keys only in function secrets ([ADR 0011](adr/0011-pictures-on-cloudinary.md)) | done   |
| IMG-02 | Covers and banners shown through Cloudinary at a fixed width, cropped to 16:9; pictures from before Cloudinary still shown from the `media` bucket                                          | done   |
| IMG-03 | **Make one with AI**: four pictures drawn for a course, choose one; `course-image` function, 40 a day counted in the database ([ADR 0012](adr/0012-ai-course-pictures.md))                  | done   |
| IMG-04 | Add or make a cover while creating a course; change or remove it later                                                                                                                      | done   |
| IMG-05 | `pnpm images:verify` checks the Cloudinary and Cloudflare keys with real requests                                                                                                           | done   |
| IMG-06 | Shrink a photo on the phone before uploading it (needs `expo-image-manipulator` and a new build)                                                                                            | todo   |
| IMG-07 | Move the pictures still in the `media` bucket to Cloudinary, then empty the bucket                                                                                                          | todo   |
| IMG-08 | AI pictures for home banners                                                                                                                                                                | todo   |

## Operations (OPS) — needs the owner

| ID     | Story                                                                                                                                                                                   | Status  |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| OPS-01 | Create the Supabase dev and production projects; push migrations; deploy functions; set secrets                                                                                         | blocked |
| OPS-02 | Google Cloud: OAuth consent screen, Web/Android client ids, YouTube Data API key                                                                                                        | blocked |
| OPS-03 | Confirm the Android package name (permanent once published): `app.config.ts` and `.env.example` disagree                                                                                | blocked |
| OPS-04 | Play Console account, store listing, Data safety form, privacy policy and account-deletion URLs                                                                                         | blocked |
| OPS-05 | Deploy the website; set `EXPO_PUBLIC_PLAYER_PAGE_URL`; add its address to Supabase redirect URLs                                                                                        | todo    |
| OPS-06 | Owner reads the privacy policy text (rewritten 28 Nov 2026 to cover tests and the website)                                                                                              | blocked |
| OPS-07 | The centre's own logo and colours, if it wants them instead of the M key                                                                                                                | blocked |
| OPS-08 | Closed testing with 12+ testers for 14 days, then production                                                                                                                            | blocked |
| OPS-09 | Add the Play App Signing SHA-1 to the Android OAuth client after the first upload                                                                                                       | todo    |
| OPS-10 | Push the five `20261128…` migrations (tests, public website, AI picture limit) to each Supabase project; regenerate types                                                               | todo    |
| OPS-12 | Set the Cloudinary and Cloudflare secrets on each Supabase project and deploy `course-image`, `upload-image`, `remove-images` ([supabase.md](operations/supabase.md), sections 4 and 5) | todo    |
| OPS-11 | After publishing, paste the Play Store link in Admin → Centre details                                                                                                                   | todo    |

## Testing (TST)

| ID     | Story                                                                                             | Status |
| ------ | ------------------------------------------------------------------------------------------------- | ------ |
| TST-01 | Component tests (jest-expo + Testing Library) for the access gate, admin forms and the test clock | todo   |
| TST-02 | No-exit checklist on 2–3 real Android phones, including a low-end one                             | todo   |
| TST-03 | End-to-end run against the dev project: sign in, add playlist, watch, open notes, delete account  | todo   |
| TST-04 | End-to-end test run: create a test, take it on a second phone, let time run out, take one late    | todo   |

## After launch (LTR)

| ID     | Story                                        | Status |
| ------ | -------------------------------------------- | ------ |
| LTR-01 | Push notification when a new lesson is added | todo   |
| LTR-02 | Continue watching and progress tracking      | todo   |
| LTR-03 | Search across courses and lessons            | todo   |
| LTR-04 | Hindi / English switch                       | todo   |
| LTR-05 | Certified students gallery                   | todo   |
| LTR-06 | Topic quizzes (built as Tests, TEST-\*)      | done   |
| LTR-07 | Recently added lessons on Home               | todo   |

## Paid courses (PAY)

| ID     | Story                                                                        | Status |
| ------ | ---------------------------------------------------------------------------- | ------ |
| PAY-01 | Enrolments; visibility helpers check enrolment for paid courses              | todo   |
| PAY-02 | Private video hosting for paid videos (Unlisted YouTube links can be shared) | todo   |
| PAY-03 | Private notes bucket with signed URLs for paid courses                       | todo   |
| PAY-04 | Payment flow that follows Google Play's billing rules                        | todo   |
| PAY-05 | One phone per account; screenshot blocking                                   | todo   |
