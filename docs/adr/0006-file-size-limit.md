# 0006 — 600-line limit per code file, with a grandfather list

**Status:** Accepted, 24 Oct 2026

## Context

Large files hide several responsibilities, make reviews slow and invite merge conflicts. The developer uses the same rule in other projects.

## Decision

`scripts/check-file-length.mjs` fails CI when a `.ts .tsx .js .jsx .mjs .cjs .css .sql` file has more than 600 lines. Exceptions are listed in `scripts/file-length-grandfather.json` with `maxLines`, a `reason` and a `backlog` story. A grandfathered file may shrink but never grow past its recorded size; once it is back under 600 its entry must be removed (the check fails on stale entries and on entries for deleted files). Files under `generated/` are exempt.

## Consequences

- Code is split by responsibility from the start (api / hooks / screens / components; one migration per concern).
- The grandfather list starts empty; adding to it is a visible, reviewed decision.
