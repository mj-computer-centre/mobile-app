# Questions for the owner

Never block on these: build with the default and record it here. The full list sent to the owner is in [PLAN.md](PLAN.md), section 8.

| #   | Question                                              | Default used                                                 | Where it matters                       |
| --- | ----------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| Q1  | App name on the Play Store and under the icon         | "Mishra Computer Centre"                                     | `apps/mobile/app.config.ts`            |
| Q2  | Android package name (permanent)                      | `in.mishracomputercentre.app`                                | `app.config.ts` (OPS-03)               |
| Q3  | Logo and brand colours                                | Generic laptop icon, blue `#1F5FAE`                          | `src/ui/theme.ts`, assets (OPS-07)     |
| Q4  | Course list, units per course, which units are shared | Demo seed: Basic, DCA, ADCA sharing Fundamentals and MS Word | `supabase/seed.sql` (dev only)         |
| Q5  | Extra signup questions (qualification, age)?          | Name, mobile, village/town, course of interest               | `schemas/profile.ts`, `profiles` table |
| Q6  | App language                                          | English UI, content in whatever language the videos are      | LTR-04                                 |
| Q7  | Can students download PDFs?                           | View in the app only (cached for offline reading)            | `features/notes`                       |
| Q8  | Contact details, timings, map link                    | Empty until filled in Admin → Contact details                | `app_settings`                         |
| Q9  | Gmail that owns the accounts; staff emails            | Owner made with `private.bootstrap_owner`                    | docs/operations/supabase.md            |
| Q10 | Can they arrange 12 testers for 14 days?              | Assumed yes                                                  | OPS-08                                 |
| Q11 | Minimum age                                           | 13+ stated in the privacy policy                             | `features/legal/privacy-screen.tsx`    |
