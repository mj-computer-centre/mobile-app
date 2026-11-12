# 0003 — Supabase with row-level security as the backend

**Status:** Accepted, 24 Oct 2026

## Context

The owner wants no server costs now. We need sign-in with Google, a relational model (courses, shared units, lessons), file storage for PDFs and pictures, and two server-side jobs (YouTube metadata, account deletion).

## Decision

Supabase free plan: Postgres, Auth (Google), Storage and Edge Functions. The app talks to PostgREST directly; **row-level security is the authorization layer**. Invariants that span rows (gap-free positions, at least one owner) live in database functions and triggers. Development uses a hosted dev project; `pnpm db:verify` applies the migrations to a throwaway local Postgres with small stand-ins for Supabase's `auth` and `storage` schemas and runs access-rule tests.

## Consequences

- No API server to write or host; every rule is in SQL and tested in SQL.
- Database types are generated from the schema (hand-maintained until the project exists).
- Free-plan limits (1 GB files, about 5 GB bandwidth a month, pausing after a week idle) are watched; Pro is $25 a month if outgrown.
- Moving off Supabase later means moving Postgres, which is standard.
