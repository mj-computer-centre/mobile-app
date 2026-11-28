# 0008 — The public website is part of the same app

**Status:** Accepted, 28 Nov 2026

## Context

Until now the website was the admin panel behind a sign-in screen. The owner wants a website anyone can open (what the centre teaches, how to reach it) and needs public pages for Google Play: a privacy policy and an account-deletion page. Options considered:

- (a) public pages inside the existing Expo web app, shown to visitors who have not signed in;
- (b) a separate marketing site (for example Next.js with ready-made web components) beside the app;
- (c) option (a) with pages pre-rendered to HTML at build time (`web.output: 'static'`).

## Decision

(a). The routes `/`, `/courses`, `/course/<id>`, `/tests` and `/contact` show a public page to a visitor and the app screen to someone signed in. The public pages live in `features/site` and use the same design system as the app. The phone app is unchanged: it starts at sign-in.

Visitors read through the `anon` role: published courses from the table, and outlines, counts and test times from `public_*` functions that return only titles and numbers. Lessons (YouTube ids, PDFs) and tests stay behind sign-in.

Not (b): two codebases, two deployments and two design systems for a centre with one part-time developer; web component kits do not run in React Native, so the app and the site would drift apart. Not (c) yet: the layouts are chosen from the window's width in JavaScript, which a pre-rendered page cannot know, so desktop visitors would see the phone layout flash before the right one; fixing that means moving the public pages to CSS media queries.

## Consequences

- One deployment, one look, and the student app works in a browser too.
- Search engines see the page titles and descriptions only after running the script. Good enough for a centre people find by name; pre-rendering is backlog WEB-06.
- The rule "nothing is readable before sign-in" became "course names and outlines are". `supabase/tests/07_public_site.test.sql` pins down exactly what a visitor can and cannot read.
