# 0001 — One Expo codebase for the app and the admin website

**Status:** Accepted, 24 Oct 2026

## Context

Students use Android phones, many of them low-end. The owner wants to manage content both on the phone and on a computer. The developer works in TypeScript/React. iPhone may come later.

## Decision

Build with Expo SDK 58 (React Native 0.88, Expo Router). The same code produces the Android app (EAS Build) and a static single-page admin website (`expo export --platform web`). Platform-specific behaviour lives in `.web.tsx` twins (video embed, PDF viewer, Google sign-in, file saving).

## Consequences

- One set of admin screens for phone and web; one design system.
- Native modules (Google sign-in, PDF viewer) mean development builds instead of Expo Go.
- iOS is a build-profile change, not a rewrite.
- Web limitations are accepted for the admin site (e.g. the no-exit guarantee is Android-only).
