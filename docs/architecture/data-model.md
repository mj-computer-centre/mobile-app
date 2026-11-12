# Data model

```
auth.users ─1:1─ profiles            staff (user_id → auth.users, role owner|admin)

courses ──< course_sections >── sections ──< section_lessons >── lessons
                (position)                      (position)        │  └─ notes_lesson_id → lessons (a PDF)
banners (→ courses)                 app_settings (single row)
```

| Table             | Purpose                                                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`        | One per user, created by a trigger on `auth.users`. Name, email, phone (10-digit Indian mobile), village/town, course of interest.                             |
| `staff`           | Who can manage content. Changed only through `add_staff_by_email` / `remove_staff` (owner only). A trigger keeps at least one owner.                           |
| `courses`         | Title, description, cover picture path, duration, prices in paise (`original_price_paise` is the crossed-out price), about points, published flag, sort order. |
| `sections`        | Reusable units ("MS Word"). A unit can sit in many courses.                                                                                                    |
| `course_sections` | Course ↔ unit, with a gap-free `position` per course. Unit labels ("Unit 2 – MS Word") are derived from it.                                                    |
| `lessons`         | Reusable library items: `video` (YouTube id, unique) or `pdf` (storage path). A video may point to a PDF lesson as its topic-wise notes.                       |
| `section_lessons` | Unit ↔ lesson, with a gap-free `position` per unit.                                                                                                            |
| `banners`         | Home screen pictures, optionally linked to a course.                                                                                                           |
| `app_settings`    | The centre's contact details (exactly one row).                                                                                                                |

Views (all `security_invoker`, so table RLS applies): `student_directory`, `staff_directory`, `section_usage`, `lesson_usage`.

## Access rules (row-level security)

| Data                     | Students (signed in)                                                       | Staff                                                           | Before sign-in |
| ------------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------- |
| Courses                  | published only                                                             | all, write                                                      | none           |
| Units, lessons, links    | those inside published courses (and notes PDFs attached to visible videos) | all; write units/lessons directly, links only through functions | none           |
| Banners                  | active only                                                                | all, write                                                      | none           |
| Contact details          | read                                                                       | read, update                                                    | read           |
| Profiles                 | own row: read, update                                                      | read all                                                        | none           |
| Staff                    | own row                                                                    | read all; change through owner-only functions                   | none           |
| Storage `notes`, `media` | read                                                                       | upload, replace, delete                                         | public URLs    |

Visibility helpers (`private.section_is_visible`, `private.lesson_is_visible`) are security-definer functions in the unexposed `private` schema. When paid courses arrive they gain an enrolment check (PAY-01).

## Functions

| Function                                                                      | Who             | What                                                                       |
| ----------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------- |
| `attach_section`, `detach_section`, `reorder_course_sections`                 | staff           | course ↔ unit membership and order                                         |
| `attach_lesson`, `attach_lessons`, `detach_lesson`, `reorder_section_lessons` | staff           | unit ↔ lesson membership and order (`attach_lessons` for playlist imports) |
| `add_staff_by_email`, `remove_staff`                                          | owner           | staff management                                                           |
| `admin_dashboard_stats`                                                       | staff           | counts for the admin home                                                  |
| `private.bootstrap_owner(email)`                                              | SQL editor only | makes the first owner                                                      |

All raise `mcc:<code>` errors that the app maps to messages. Tests: `supabase/tests/*.test.sql`, run by `pnpm db:verify`.
