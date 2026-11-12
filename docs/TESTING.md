# Testing

## Automated (run by `pnpm check` and CI)

| Layer          | Tool                      | Where                                                           | Covers                                                                                                                                                                                                              |
| -------------- | ------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain         | Vitest                    | `packages/shared/src/**/*.test.ts`                              | YouTube link parsing, durations, player navigation policy, rupee formatting, phone numbers, CSV (incl. formula injection), catalog mapping and lesson order, form schemas, error codes, edge-function parser parity |
| Database       | SQL on throwaway Postgres | `supabase/tests/*.test.sql` via `pnpm db:verify`                | Row-level security for students, staff, owner and anonymous visitors; staff management and last-owner protection; ordering functions; storage policies; data constraints; the demo seed                             |
| Edge functions | `deno check`              | `pnpm functions:check`                                          | Types of both functions against their imports                                                                                                                                                                       |
| App            | `tsc`, ESLint             | `pnpm typecheck`, `pnpm lint`                                   | Types against generated database types; module boundaries; hooks rules                                                                                                                                              |
| Bundles        | Expo export               | `pnpm build:web` (CI); `expo export --platform android` locally | Every import and platform twin resolves                                                                                                                                                                             |

## Definition of done

- `pnpm check` passes.
- New SQL objects have row-level security and tests in `supabase/tests`.
- New pure logic has unit tests in `packages/shared`.
- Player, upload or sign-in changes: the relevant manual checks below were run on a phone.

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
