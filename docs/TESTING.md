# Testing

## Automated (run by `pnpm check` and CI)

| Layer          | Tool                      | Where                                                           | Covers                                                                                                                                                                                                                                                                                                        |
| -------------- | ------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain         | Vitest                    | `packages/shared/src/**/*.test.ts`                              | YouTube link parsing, durations, player navigation policy, rupee formatting, phone numbers, CSV (incl. formula injection), catalog mapping and lesson order, form schemas, error codes, edge-function parser parity, test phases and grouping, pass marks, the pasted-questions parser, date and time wording |
| Database       | SQL on throwaway Postgres | `supabase/tests/*.test.sql` via `pnpm db:verify`                | Row-level security for students, staff, owner and visitors who have not signed in; staff management and last-owner protection; ordering functions; storage policies; data constraints; taking a test (window, deadline, late attempts, time over, scores, rank, review); managing questions; the demo seed    |
| Edge functions | `deno check`              | `pnpm functions:check`                                          | Types of both functions against their imports                                                                                                                                                                                                                                                                 |
| App            | `tsc`, ESLint             | `pnpm typecheck`, `pnpm lint`                                   | Types against generated database types; module boundaries; hooks rules                                                                                                                                                                                                                                        |
| Bundles        | Expo export               | `pnpm build:web` (CI); `expo export --platform android` locally | Every import and platform twin resolves                                                                                                                                                                                                                                                                       |

## Definition of done

- `pnpm check` passes.
- New SQL objects have row-level security and tests in `supabase/tests`.
- New pure logic has unit tests in `packages/shared`.
- New or changed screens were looked at in light and dark, at a phone's width and on a wide screen (the dev bypass makes this possible without a backend; `visitor` shows the public website).
- Player, upload, sign-in or test-taking changes: the relevant manual checks below were run on a phone.

## Manual checks on a real phone (each release)

### No-exit checklist (player)

Play a video, then try each of these. Nothing may open YouTube, Chrome or another app:

- [ ] Tap the YouTube logo, the video title and the channel picture.
- [ ] Let a video end; tap the end-screen suggestions if they appear before the Up next card.
- [ ] Tap an ad and its "Visit advertiser" button, if YouTube shows one.
- [ ] Long-press inside the player.
- [ ] Enter full screen; the phone turns sideways; exit full screen; it returns to portrait.
- [ ] Play next video from the Up next card and from "Next video".

### Content flow

- [ ] Admin: create a course, add a new unit, paste a playlist link, untick one video, add the rest.
- [ ] Admin: a video with embedding switched off is flagged and left unticked.
- [ ] Admin: upload a unit PDF; attach a notes PDF to a video; reorder lessons; remove one.
- [ ] Student (another phone): the published course appears after pull-to-refresh; drafts do not.
- [ ] Student: open the notes, go offline, close the app, reopen the course and the same notes.
- [ ] Student: delete account; signing in again shows the profile form.

### Tests

Use two phones (or a phone and the website): one signed in as staff, one as a student.

- [ ] Admin: create a test that opens in two minutes and closes in ten, 3 minutes allowed. Add one question by hand and paste three more. Switch on "Show to students".
- [ ] Student: the test is under "Coming up" and cannot be started. When it opens, start it; the clock runs down from 3:00.
- [ ] Student: answer two questions, close the app, open it again: "Continue test" is there, the answers are still chosen and the clock did not stop.
- [ ] Student: switch to aeroplane mode, answer a question (it says not saved yet), switch back and submit: the answer counted.
- [ ] Student: on a second test, let the clock reach zero without submitting: the test closes itself and shows a score.
- [ ] Student: the score shows at once; the rank and "See the answers" appear only after the test's closing time.
- [ ] Admin: Results lists the student with the right score; download the list; open the student's answers.
- [ ] Second student who did not take it: after closing time it says missed. Admin switches on "Let students who missed it take it later": the student can now take it and the result is marked late.
- [ ] Admin: "Let this student take the test again" removes the attempt; the student can start afresh.
- [ ] Set the phone's clock ten minutes wrong and open a running test: the time left still matches the other phone.

### Pictures

Needs the Cloudinary and Cloudflare secrets set and the three picture functions deployed (`pnpm images:verify` checks the keys first).

- [ ] Admin, on a phone: New course → type a name → **Make one with AI** → **Make 4 pictures**. Four pictures arrive one by one; none has writing on it. Choose one, **Use this picture**, **Create course**: the course opens with that cover.
- [ ] Admin: on the same course, **Upload a picture** from the gallery: the cover changes, and the old picture is gone from the Cloudinary folder `mishra-computer-centre/courses`.
- [ ] Admin: **Remove picture**: the coloured panel with the course's short name comes back.
- [ ] Admin, on the website: upload a tall photo as a cover: the card shows its middle, cropped to 16:9, not squashed.
- [ ] Admin: add a banner, then delete it: it leaves `mishra-computer-centre/banners` on Cloudinary.
- [ ] Student: the new cover shows on the course card and the course page, also after closing and reopening the app without internet.
- [ ] A course whose picture was uploaded before Cloudinary still shows it.

### Website

- [ ] Not signed in: home, Courses, a course's outline, Tests and Contact open; nothing plays and no lesson link works without signing in.
- [ ] `/privacy` and `/delete-account` open without signing in, in a private window, on a phone.
- [ ] Sign in on the website as a student: the same courses, lessons and tests as in the app.
- [ ] Sign in as staff: the Admin tab is there; a student who types `/admin` or `/manage/tests` is sent home.
- [ ] Sign in as staff: Courses has a "For staff" box with **New course** and shows drafts marked as drafts; Tests has **New test** and **Manage tests**. Sign in as a student: neither box is there, and no draft is listed.
