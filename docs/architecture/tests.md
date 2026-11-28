# Tests: how they work

A test is a set of multiple-choice questions that students answer against a clock. The owner or staff create it in Admin → Tests; students take it in the Tests tab of the app or on the website. This page is the behaviour; the tables are in [data-model.md](data-model.md).

## The rules

| Rule                  | What happens                                                                                                                                                                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Window                | Every test has an opening and a closing time. A student can start any time in between.                                                                                                                                                                                                                     |
| Time allowed          | Starting sets the student's deadline: the test's minutes from now, or the closing time if that comes first. So everyone is finished when the test closes, and the owner can look at results straight away.                                                                                                 |
| One attempt           | A student takes a test once. Closing the app does not stop the clock; opening the test again carries on with the same attempt and the answers saved so far.                                                                                                                                                |
| Missed tests ("late") | If the owner switches on "Let students who missed it take it later", a student who did not take the test in its window can still start it afterwards. They get the full minutes and the attempt is marked late. The switch can be turned on after the test has ended (Admin → Tests → the test → Results). |
| Time over             | Answers are refused 60 seconds after the deadline (the minute covers a slow connection on the last answer). An attempt whose deadline has passed counts as finished even if the student never pressed Submit.                                                                                              |
| Score                 | Shown to the student as soon as their attempt is finished: the sum of the marks of correctly answered questions. No negative marking.                                                                                                                                                                      |
| Rank                  | Shown once the test window has ended, among students who took it in time. Best score first; a faster finish breaks a tie. Late attempts have no rank.                                                                                                                                                      |
| Seeing the answers    | After the window has ended, and only if the test has "Show students the correct answers" on. While other students can still take the test, nobody sees the key.                                                                                                                                            |
| Taking it again       | Staff can delete one student's attempt from the results ("Let this student take the test again").                                                                                                                                                                                                          |
| Drafts                | A test is a draft until "Show to students" is on. Staff can try a draft themselves.                                                                                                                                                                                                                        |

Question limits: two to six options, one correct; 1 to 100 marks; up to 200 questions a test.

## Where the rules are enforced

In the database, not in the app. `start_test`, `save_test_answers` and `submit_test` (`supabase/migrations/20261128000200_tests_access.sql`) check the server's clock, so a phone with the wrong time or a modified app cannot start early, answer after time is up, or take a test twice. Row-level security keeps questions from students until they have started, and the answer key from students always: they receive it only through `test_attempt_review`, which returns nothing until the window has ended.

`supabase/tests/05_tests_taking.test.sql` and `06_tests_admin.test.sql` hold these rules down, one check per row of the table above.

## In the app

- **Phase.** `testPhase` (`packages/shared/src/tests/status.ts`) turns a test and the student's attempt into one of `upcoming`, `open`, `in_progress`, `finished`, `late_open`, `missed`. Every screen draws from it.
- **The clock.** `my_tests` returns the server's time. The app keeps the difference from the phone's clock (`serverClockOffset`) and counts down against server time (`useServerNow`), so a wrong phone clock neither shortens nor lengthens a test.
- **Saving answers.** Each choice is saved as it is made. A save that fails (no signal) is retried, and Submit sends every answer again, so nothing depends on each small save getting through. When the clock reaches zero the app submits by itself.
- **Scores are computed, not stored.** `private.attempt_marks` joins answers to the key when a result is read. Fixing a wrong key in the editor re-marks everyone at once.
- **Personal data.** Attempts and scores are fetched under `['tests', …]` query keys, which are never written to the on-device cache.

## Adding questions quickly

Admin → Tests → a test → "Paste many questions" accepts plain text in the form teachers already type:

```
1. Full form of CPU?
A) Central Program Unit
B) Central Processing Unit *
C) Control Panel Unit

2. Which key erases the letter before the cursor?
A) Delete
B) Backspace
Answer: B
Marks: 2
```

The correct option is marked with `*` (or a tick) or named on an `Answer:` line. `Marks:` and `Explanation:` lines are optional. Hindi option letters (क ख ग घ) and `उत्तर:` work too. The parser is `parseQuestionsText` (`packages/shared/src/tests/import-questions.ts`), with its cases in the test file beside it; the import is all or nothing.

## Not built

Pictures in questions, questions with several right answers, shuffling, negative marking, a notification when a test opens, and tests limited to one course's students. See the backlog (`TEST-*`).
