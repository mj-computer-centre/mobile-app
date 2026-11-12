# 0007 — Declarative access gate; only catalog data cached on the device

**Status:** Accepted, 24 Oct 2026

## Context

Every screen except the privacy and account-deletion pages needs sign-in; students must complete a short profile once (the owner's lead list); admin screens are for staff. Many students have poor connectivity, and notes opened once should open again offline.

## Decision

- The root layout computes one access state (`useAccess`) and uses Expo Router's `Stack.Protected` groups to decide which screens exist. Row-level security enforces the same rules on the server.
- React Query is persisted to the device (expo-sqlite key-value store) for **catalog queries only**, for a week, with a cache-buster version. PDFs are cached by react-native-pdf. Profile, staff and admin data are never written to disk.
- On sign-out the query cache is cleared so the next person on a shared phone sees nothing of the previous one.

## Consequences

- No hand-written redirects scattered across screens.
- A student can reopen a course and its cached notes offline; videos still need the internet.
