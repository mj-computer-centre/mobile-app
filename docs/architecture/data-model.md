# Data model

```
auth.users ─1:1─ profiles            staff (user_id → auth.users, role owner|admin)

courses ──< course_sections >── sections ──< section_lessons >── lessons
                (position)                      (position)        │  └─ notes_lesson_id → lessons (a PDF)
banners (→ courses)                 app_settings (single row)

tests (→ courses) ──< test_questions ──1:1── test_answer_keys
  └──< test_attempts (→ auth.users) ──< test_answers >── test_questions
```

| Table              | Purpose                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `profiles`         | One per user, created by a trigger on `auth.users`. Name, email, phone (10-digit Indian mobile), village/town, course of interest.                                                               |
| `staff`            | Who can manage content. Changed only through `add_staff_by_email` / `remove_staff` (owner only). A trigger keeps at least one owner.                                                             |
| `courses`          | Title, description, cover picture (`thumbnail_path`, see Pictures below), duration, prices in paise (`original_price_paise` is the crossed-out price), about points, published flag, sort order. |
| `sections`         | Reusable units ("MS Word"). A unit can sit in many courses.                                                                                                                                      |
| `course_sections`  | Course ↔ unit, with a gap-free `position` per course. Unit labels ("Unit 2 – MS Word") are derived from it.                                                                                      |
| `lessons`          | Reusable library items: `video` (YouTube id, unique) or `pdf` (storage path). A video may point to a PDF lesson as its topic-wise notes.                                                         |
| `section_lessons`  | Unit ↔ lesson, with a gap-free `position` per unit.                                                                                                                                              |
| `banners`          | Home screen pictures (`image_path`, see Pictures below), optionally linked to a course.                                                                                                          |
| `app_settings`     | The centre's contact details and the app's Play Store link (exactly one row).                                                                                                                    |
| `tests`            | A timed multiple-choice test: name, instructions, optional course, minutes allowed, the window students can start in (`starts_at`–`ends_at`), late attempts, review, pass mark, draft.           |
| `test_questions`   | A question: prompt, two to six options, marks, gap-free `position` per test.                                                                                                                     |
| `test_answer_keys` | The correct option and an explanation, one row per question. A table of its own so row-level security can hide it from students (a policy hides rows, not columns).                              |
| `test_attempts`    | One per student per test: when they started, their deadline, when they submitted, whether it was late.                                                                                           |
| `test_answers`     | The option a student chose for a question of their attempt.                                                                                                                                      |
| `ai_image_usage`   | How many AI pictures were drawn on each day (UTC). No personal data. Nobody reads or writes it directly: `use_ai_image_allowance` counts in it.                                                  |

Scores are never stored. They are worked out from `test_answers` and `test_answer_keys` each time they are read, so correcting a wrong key re-marks every attempt. How tests behave (the window, deadlines, late attempts, when answers are shown) is in [tests.md](tests.md).

Views (all `security_invoker`, so table RLS applies): `student_directory`, `staff_directory`, `section_usage`, `lesson_usage`, `test_usage` (question, mark and attempt counts for the admin list).

## Pictures

`courses.thumbnail_path` and `banners.image_path` hold where a picture is kept, in one of two forms:

- a **Cloudinary URL** (`https://res.cloudinary.com/<cloud>/image/upload/v…/mishra-computer-centre/courses/<name>.jpg`), for every picture stored since 28 Nov 2026;
- a **path in the `media` storage bucket** (`courses/<course id>/<file>`, `banners/<file>`), for pictures uploaded before that.

`isCloudinaryImage` (`packages/shared/src/images`) tells them apart, and nothing else is ever treated as a URL: any other value is looked for in the bucket, so a stray link in these columns cannot make the app load a picture from somewhere unknown. The pictures themselves are outside the database. The `upload-image` function decides who may store one (staff only); row-level security decides, as before, who may put it on a course or banner.

## Access rules (row-level security)

| Data                     | Students (signed in)                                                       | Staff                                                           | Before sign-in (the public website)               |
| ------------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| Courses                  | published only                                                             | all, write                                                      | published only, read                              |
| Units, lessons, links    | those inside published courses (and notes PDFs attached to visible videos) | all; write units/lessons directly, links only through functions | titles only, through `public_course_outline`      |
| Banners                  | active only                                                                | all, write                                                      | none                                              |
| Contact details          | read                                                                       | read, update                                                    | read                                              |
| Profiles                 | own row: read, update                                                      | read all                                                        | none                                              |
| Staff                    | own row                                                                    | read all; change through owner-only functions                   | none                                              |
| Tests                    | published only                                                             | all, write                                                      | titles and times, through `public_upcoming_tests` |
| Test questions           | only of a test they have started                                           | all; write only through functions                               | none                                              |
| Answer keys              | never from the table; through `test_attempt_review` once the test is over  | all                                                             | none                                              |
| Attempts and answers     | own, read; changed only through `start_test` / `save_…` / `submit_test`    | read all; delete an attempt (lets the student take it again)    | none                                              |
| Storage `notes`, `media` | read                                                                       | upload, replace, delete                                         | public URLs                                       |
| AI picture count         | none                                                                       | only through `use_ai_image_allowance`                           | none                                              |

Visibility helpers (`private.section_is_visible`, `private.lesson_is_visible`, `private.has_attempt`, `private.owns_attempt`) are security-definer functions in the unexposed `private` schema. When paid courses arrive, the course helpers gain an enrolment check (PAY-01).

A visitor never reads lessons, units or tests from the tables: YouTube ids and PDF files stay behind sign-in, which is how the centre learns who its students are. The website gets course outlines, counts and test times from `public_*` functions that return only titles and numbers.

## Functions

| Function                                                                           | Who                     | What                                                                                          |
| ---------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| `attach_section`, `detach_section`, `reorder_course_sections`                      | staff                   | course ↔ unit membership and order                                                            |
| `attach_lesson`, `attach_lessons`, `detach_lesson`, `reorder_section_lessons`      | staff                   | unit ↔ lesson membership and order (`attach_lessons` for playlist imports)                    |
| `add_staff_by_email`, `remove_staff`                                               | owner                   | staff management                                                                              |
| `admin_dashboard_stats`                                                            | staff                   | counts for the admin home, including tests                                                    |
| `save_test_question`, `import_test_questions`, `delete_test_question`, `reorder_…` | staff                   | questions with their answer keys, kept in gap-free order                                      |
| `test_results`                                                                     | staff                   | everyone who took a test, best score first                                                    |
| `start_test`                                                                       | signed in               | starts the caller's attempt if the test is open (or late attempts are allowed), or resumes it |
| `save_test_answers`, `submit_test`                                                 | signed in               | answers while the clock runs; submitting sends every answer again                             |
| `my_tests`                                                                         | signed in               | published tests with the caller's attempt and score, and the server's time                    |
| `test_attempt_summary`, `test_attempt_review`                                      | owner of attempt, staff | the result; the answers once the test window has ended                                        |
| `use_ai_image_allowance`                                                           | staff                   | counts one AI picture against today's 40, or raises `ai_images_used_up`                       |
| `public_course_outline`, `public_site_stats`, `public_upcoming_tests`              | anyone                  | what the public website shows                                                                 |
| `private.bootstrap_owner(email)`                                                   | SQL editor only         | makes the first owner                                                                         |

All raise `mcc:<code>` errors that the app maps to messages. Tests: `supabase/tests/*.test.sql`, run by `pnpm db:verify`.
