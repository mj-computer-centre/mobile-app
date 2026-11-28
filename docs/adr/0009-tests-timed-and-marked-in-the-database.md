# 0009 — Tests are timed and marked in the database

**Status:** Accepted, 28 Nov 2026

## Context

The owner wants to set tests that students take in a time interval, and to let students who missed one take it later when he allows it. Students use cheap phones on poor connections, some with wrong clocks, and a test's result should be something the centre can trust.

## Decision

- **The server's clock decides.** `start_test`, `save_test_answers` and `submit_test` check `now()` in Postgres. The app only displays a countdown, corrected by the difference between the server's clock and the phone's.
- **Window and time allowed, as in Moodle.** A student starts any time in the window and gets the test's minutes or until the window closes, whichever comes first. Everyone is done when the test closes.
- **Late attempts are a switch on the test** (`allow_late`), not a per-student permission: it answers "if admin allows, anyone can take it later" with one control that can be turned on after the test has ended. Late attempts are marked and left out of the rank.
- **The answer key is a separate table** (`test_answer_keys`). Row-level security hides rows, not columns, and staff and students share one database role, so a column could not be hidden from students.
- **Scores are computed when read**, from answers and the key. Nothing to keep in step, and correcting a wrong key re-marks every attempt.
- **Questions are readable only after starting**, and the key only after the window has ended, through a function.
- **Submit carries every answer.** Answers are saved one by one as they are chosen, but nothing depends on those saves arriving.

Details: [tests.md](../architecture/tests.md).

## Consequences

- A modified app cannot start early, run over time, take a test twice or read the key.
- Editing a question after students have answered it changes what their answers mean; the editor warns, and the database does not forbid it (the owner must be able to fix a mistake).
- Results need the key joined for every attempt. Fine for a centre's numbers (hundreds of students); a stored score would be the first optimisation if it ever is not.
- One attempt per student; a retake is staff deleting the attempt.
