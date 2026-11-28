# Architecture decision records

Short records of decisions that shape the codebase: the context, what was decided, and what follows from it. Add a new numbered file for each new decision; supersede rather than rewrite old ones.

| #                                                      | Decision                                                                                          | Status   |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | -------- |
| [0001](0001-expo-react-native.md)                      | One Expo (React Native) codebase for the Android app and the admin website                        | Accepted |
| [0002](0002-monorepo-tooling.md)                       | pnpm workspaces + Turborepo, hoisted node_modules, framework-free shared package                  | Accepted |
| [0003](0003-supabase-backend.md)                       | Supabase with row-level security as the only backend                                              | Accepted |
| [0004](0004-youtube-embed-navigation-guard.md)         | YouTube embed in a WebView with a navigation guard and a self-hosted player page                  | Accepted |
| [0005](0005-reusable-units-and-lessons.md)             | Units and lessons are a reusable library linked to courses                                        | Accepted |
| [0006](0006-file-size-limit.md)                        | 600-line limit per code file, with a grandfather list                                             | Accepted |
| [0007](0007-access-gate-and-offline-cache.md)          | Declarative access gate; only catalog data cached on the device                                   | Accepted |
| [0008](0008-public-website-in-the-same-app.md)         | The public website is part of the same app, read through the `anon` role                          | Accepted |
| [0009](0009-tests-timed-and-marked-in-the-database.md) | Tests are timed and marked in the database; the answer key is its own table                       | Accepted |
| [0010](0010-design-system-of-keys.md)                  | A design system built on keys: ink, cobalt, marigold, Anek Latin                                  | Accepted |
| [0011](0011-pictures-on-cloudinary.md)                 | Pictures are kept on Cloudinary, uploaded through an edge function                                | Accepted |
| [0012](0012-ai-course-pictures.md)                     | AI course pictures: drawn on Cloudflare, never stored until chosen, no course words in the prompt | Accepted |
