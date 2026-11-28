import { formatDistance } from '../datetime/format';
import type { MyTest, TestAttempt, TestPhase } from './types';

/**
 * The difference between the server's clock and this device's, in milliseconds. Tests are timed
 * by the server; adding this to Date.now() keeps the countdown right on a phone whose clock is
 * wrong.
 */
export function serverClockOffset(serverNow: string, deviceNow: number): number {
  const server = Date.parse(serverNow);
  return Number.isFinite(server) ? server - deviceNow : 0;
}

export function attemptIsFinished(
  attempt: Pick<TestAttempt, 'submittedAt' | 'deadlineAt'>,
  now: number,
): boolean {
  return attempt.submittedAt !== null || now > Date.parse(attempt.deadlineAt);
}

export function testPhase(
  test: Pick<MyTest, 'startsAt' | 'endsAt' | 'allowLate' | 'attempt'>,
  now: number,
): TestPhase {
  if (test.attempt) return attemptIsFinished(test.attempt, now) ? 'finished' : 'in_progress';
  if (now < Date.parse(test.startsAt)) return 'upcoming';
  if (now < Date.parse(test.endsAt)) return 'open';
  return test.allowLate ? 'late_open' : 'missed';
}

/** Milliseconds a student has left in their attempt; 0 once time is up. */
export function timeLeftMs(attempt: Pick<TestAttempt, 'deadlineAt'>, now: number): number {
  return Math.max(0, Date.parse(attempt.deadlineAt) - now);
}

/** The next moment a test's phase can change by itself, so a screen knows when to look again. */
export function nextPhaseChangeAt(
  test: Pick<MyTest, 'startsAt' | 'endsAt' | 'attempt'>,
  now: number,
): number | null {
  const moments = [
    Date.parse(test.startsAt),
    Date.parse(test.endsAt),
    test.attempt && test.attempt.submittedAt === null ? Date.parse(test.attempt.deadlineAt) : NaN,
  ].filter((moment) => Number.isFinite(moment) && moment > now);
  return moments.length > 0 ? Math.min(...moments) : null;
}

export interface TestGroups {
  /** Can be taken or continued now: in progress first, then open, soonest to close first. */
  now: MyTest[];
  /** Not started yet, soonest first. */
  upcoming: MyTest[];
  /** Missed tests that can still be taken late, most recent first. */
  late: MyTest[];
  /** Finished or missed for good, most recent first. */
  past: MyTest[];
}

export function groupTests(tests: readonly MyTest[], now: number): TestGroups {
  const groups: TestGroups = { now: [], upcoming: [], late: [], past: [] };
  for (const test of tests) {
    const phase = testPhase(test, now);
    if (phase === 'in_progress' || phase === 'open') groups.now.push(test);
    else if (phase === 'upcoming') groups.upcoming.push(test);
    else if (phase === 'late_open') groups.late.push(test);
    else groups.past.push(test);
  }
  const start = (test: MyTest) => Date.parse(test.startsAt);
  const end = (test: MyTest) => Date.parse(test.endsAt);
  groups.now.sort(
    (a, b) => Number(Boolean(b.attempt)) - Number(Boolean(a.attempt)) || end(a) - end(b),
  );
  groups.upcoming.sort((a, b) => start(a) - start(b));
  groups.late.sort((a, b) => end(b) - end(a));
  groups.past.sort((a, b) => end(b) - end(a));
  return groups;
}

/** Whole-number percentage of the marks; 0 when the test has no marks. */
export function scorePercent(score: number, totalMarks: number): number {
  return totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
}

/** 'passed' or 'failed' when the test has a pass mark; null when it has none. */
export function testOutcome(
  score: number,
  totalMarks: number,
  passPercent: number | null,
): 'passed' | 'failed' | null {
  if (passPercent === null || totalMarks <= 0) return null;
  // Compare marks, not rounded percentages: 49.6% is not a pass at 50%.
  return score * 100 >= passPercent * totalMarks ? 'passed' : 'failed';
}

/** One line under a test's name saying where it stands: "Starts in 2 days", "Ends in 40 minutes". */
export function phaseLine(test: MyTest, now: number): string {
  const phase = testPhase(test, now);
  switch (phase) {
    case 'upcoming':
      return `Starts in ${formatDistance(Date.parse(test.startsAt) - now)}`;
    case 'open':
      return `Open now. Closes in ${formatDistance(Date.parse(test.endsAt) - now)}`;
    case 'in_progress':
      return test.attempt
        ? `You have ${formatDistance(timeLeftMs(test.attempt, now))} left`
        : 'In progress';
    case 'finished':
      return test.score === null
        ? 'Finished'
        : `You scored ${test.score} out of ${test.totalMarks}`;
    case 'late_open':
      return 'You missed this test. You can still take it.';
    case 'missed':
      return 'You missed this test';
  }
}
