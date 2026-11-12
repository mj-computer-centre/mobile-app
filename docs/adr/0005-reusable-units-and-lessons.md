# 0005 — Units and lessons are a reusable library

**Status:** Accepted, 24 Oct 2026

## Context

Courses overlap heavily: MS Word, Excel and Fundamentals appear in Basic, DCA and ADCA. STP's app copies the same playlist link into up to five course screens in code. The owner wants to add PDFs "section-wise or topic-wise".

## Decision

`sections` (units) and `lessons` are library items. `course_sections` and `section_lessons` link them with per-parent positions. A video lesson may point to a PDF lesson as its topic-wise notes; a PDF lesson inside a unit is unit-wise notes. Unit numbers are derived from position per course. One lesson row per YouTube video (unique constraint), so re-adding a link reuses it.

## Consequences

- Edit a unit once and every course that uses it changes; the editor warns when a unit is shared.
- Removing a unit from a course never deletes it; deleting from the library warns with usage counts (`section_usage`, `lesson_usage` views).
- Ordering needs locking functions rather than plain updates.
