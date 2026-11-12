# 0002 — Monorepo tooling

**Status:** Accepted, 24 Oct 2026

## Context

Domain logic (YouTube link parsing, the player navigation policy, money, form schemas, row mappers) must be testable without React Native and shared by the app, its tests and future servers. The developer's other projects use pnpm and Turborepo.

## Decision

- pnpm workspaces (`apps/*`, `packages/*`) orchestrated by Turborepo.
- `packages/shared` (`@mcc/shared`) is framework-free TypeScript consumed as source (no build step); ESLint forbids React/Expo/Supabase imports in it.
- `nodeLinker: hoisted`: Expo supports isolated installs from SDK 54, but react-native-pdf, react-native-blob-util and react-native-youtube-iframe still expect a flat `node_modules`. Expo's own default for pnpm is hoisted.
- Vitest for the shared package; SQL tests for the database (`pnpm db:verify`).

## Consequences

- Pure logic gets fast unit tests; the app stays thin.
- The edge functions (Deno) cannot import workspace packages; the one piece they share (YouTube parsing) is copied and kept identical by a parity test.
