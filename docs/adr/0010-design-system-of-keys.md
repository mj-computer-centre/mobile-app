# 0010 — A design system built on keys

**Status:** Accepted, 28 Nov 2026

## Context

The first version looked like a default app: one blue, system type, a card around everything. The owner asked for a complete redesign of the app and the website. The centre has not supplied a logo or colours (backlog OPS-07), so the look has to stand on its own and be easy to rebrand.

## Decision

- **One idea from the subject.** Students come to learn the keyboard, so what you press is a key: a face on a darker edge that goes down when pressed (`Key`). Buttons, course tiles, answer options and the question grid share the shape.
- **Three colours with jobs.** Ink blue for brand surfaces, cobalt for what can be chosen, marigold for the one main action of a screen. Light and dark sets in one file.
- **Anek Latin** (Ek Type, Mumbai) for what the app says; the phone's own font for what people read and write, which also covers Hindi. Three weights, bundled, each registered as its own family.
- **Plain React Native components**, no styling library and no web component kit: the same components draw the Android app and the website.
- **Rules that keep it from sliding back**: one accent button per screen, grouped rows instead of a card per row, only keys move, real numbers only. Written down in [design-system.md](../architecture/design-system.md).

Web-only component catalogues were considered for the public pages and set aside: they need the browser's DOM and a CSS framework, so they could not be shared with the Android app ([ADR 0008](0008-public-website-in-the-same-app.md)).

## Consequences

- Rebranding is a palette change in `ui/theme.ts`, three colours in `app.config.ts` and `public/index.html`, and new pictures in `assets/images`.
- Three font files (about 110 KB each) ship in the app and load after the page on the website, where text shows in the system font first.
- The app icon, splash mark and favicon are the M key until the centre has a logo.
