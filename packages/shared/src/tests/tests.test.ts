import { describe, expect, it } from 'vitest';

import {
  toAdminTest,
  toAnswerSheet,
  toAttemptSummary,
  toMyTest,
  toTestQuestionWithKey,
  type MyTestRow,
} from './mappers';
import {
  attemptIsFinished,
  groupTests,
  nextPhaseChangeAt,
  phaseLine,
  scorePercent,
  serverClockOffset,
  testOutcome,
  testPhase,
  timeLeftMs,
} from './status';
import type { MyTest } from './types';

const HOUR = 3_600_000;
const NOW = Date.parse('2026-11-30T05:00:00.000Z');
const iso = (offsetMs: number) => new Date(NOW + offsetMs).toISOString();

function row(overrides: Partial<MyTestRow> = {}): MyTestRow {
  return {
    id: 't1',
    title: 'Unit test 1',
    description: 'Read every question.',
    course_id: null,
    course_title: null,
    duration_minutes: 30,
    starts_at: iso(-HOUR),
    ends_at: iso(HOUR),
    allow_late: false,
    show_review: true,
    pass_percent: 50,
    question_count: 20,
    total_marks: 20,
    attempt_id: null,
    attempt_started_at: null,
    attempt_deadline_at: null,
    attempt_submitted_at: null,
    attempt_is_late: null,
    score: null,
    server_now: iso(0),
    ...overrides,
  };
}

const test = (overrides: Partial<MyTestRow> = {}): MyTest => toMyTest(row(overrides));
const started = (overrides: Partial<MyTestRow> = {}): MyTest =>
  test({
    attempt_id: 'a1',
    attempt_started_at: iso(-10 * 60_000),
    attempt_deadline_at: iso(20 * 60_000),
    attempt_is_late: false,
    ...overrides,
  });

describe('toMyTest', () => {
  it('has no attempt until the student starts', () => {
    expect(test().attempt).toBeNull();
    expect(test().score).toBeNull();
  });

  it('builds the attempt from the joined columns', () => {
    expect(started().attempt).toEqual({
      id: 'a1',
      testId: 't1',
      startedAt: iso(-10 * 60_000),
      deadlineAt: iso(20 * 60_000),
      submittedAt: null,
      isLate: false,
    });
  });

  it('keeps the score only when there is an attempt', () => {
    expect(started({ attempt_submitted_at: iso(0), score: 17 }).score).toBe(17);
    expect(test({ score: 17 }).score).toBeNull();
  });
});

describe('testPhase', () => {
  it('is upcoming before the window opens', () => {
    expect(testPhase(test({ starts_at: iso(HOUR), ends_at: iso(2 * HOUR) }), NOW)).toBe('upcoming');
  });

  it('is open inside the window', () => {
    expect(testPhase(test(), NOW)).toBe('open');
  });

  it('opens exactly at the start time and closes exactly at the end time', () => {
    expect(testPhase(test({ starts_at: iso(0) }), NOW)).toBe('open');
    expect(testPhase(test({ ends_at: iso(0) }), NOW)).toBe('missed');
  });

  it('is missed after the window, unless late attempts are allowed', () => {
    const past = { starts_at: iso(-3 * HOUR), ends_at: iso(-HOUR) };
    expect(testPhase(test(past), NOW)).toBe('missed');
    expect(testPhase(test({ ...past, allow_late: true }), NOW)).toBe('late_open');
  });

  it('is in progress while the student still has time', () => {
    expect(testPhase(started(), NOW)).toBe('in_progress');
  });

  it('is finished once submitted, or once the time has run out', () => {
    expect(testPhase(started({ attempt_submitted_at: iso(-60_000) }), NOW)).toBe('finished');
    expect(testPhase(started({ attempt_deadline_at: iso(-1) }), NOW)).toBe('finished');
  });

  it('follows the attempt, not the window: a late attempt is in progress after the window', () => {
    const late = started({
      starts_at: iso(-3 * HOUR),
      ends_at: iso(-HOUR),
      allow_late: true,
      attempt_is_late: true,
    });
    expect(testPhase(late, NOW)).toBe('in_progress');
  });
});

describe('time helpers', () => {
  it('measures the gap between the server clock and the device clock', () => {
    expect(serverClockOffset(iso(90_000), NOW)).toBe(90_000);
    expect(serverClockOffset(iso(-5_000), NOW)).toBe(-5_000);
    expect(serverClockOffset('not a date', NOW)).toBe(0);
  });

  it('counts the time left down to zero, never below', () => {
    const attempt = started().attempt;
    expect(attempt && timeLeftMs(attempt, NOW)).toBe(20 * 60_000);
    expect(attempt && timeLeftMs(attempt, NOW + HOUR)).toBe(0);
  });

  it('treats the deadline itself as still in time', () => {
    const attempt = { submittedAt: null, deadlineAt: iso(0) };
    expect(attemptIsFinished(attempt, NOW)).toBe(false);
    expect(attemptIsFinished(attempt, NOW + 1)).toBe(true);
  });

  it('finds the next moment a test changes by itself', () => {
    expect(nextPhaseChangeAt(test({ starts_at: iso(HOUR), ends_at: iso(2 * HOUR) }), NOW)).toBe(
      NOW + HOUR,
    );
    expect(nextPhaseChangeAt(started(), NOW)).toBe(NOW + 20 * 60_000);
    expect(
      nextPhaseChangeAt(test({ starts_at: iso(-3 * HOUR), ends_at: iso(-HOUR) }), NOW),
    ).toBeNull();
  });
});

describe('groupTests', () => {
  const upcomingLater = test({ id: 'u2', starts_at: iso(48 * HOUR), ends_at: iso(49 * HOUR) });
  const upcomingSoon = test({ id: 'u1', starts_at: iso(2 * HOUR), ends_at: iso(3 * HOUR) });
  const open = test({ id: 'o1', ends_at: iso(30 * 60_000) });
  const inProgress = started({ id: 'p1', ends_at: iso(HOUR) });
  const late = test({
    id: 'l1',
    starts_at: iso(-30 * HOUR),
    ends_at: iso(-29 * HOUR),
    allow_late: true,
  });
  const missed = test({ id: 'm1', starts_at: iso(-50 * HOUR), ends_at: iso(-49 * HOUR) });
  const done = started({
    id: 'd1',
    starts_at: iso(-5 * HOUR),
    ends_at: iso(-4 * HOUR),
    attempt_submitted_at: iso(-4.5 * HOUR),
    score: 12,
  });
  const groups = groupTests(
    [upcomingLater, missed, open, done, upcomingSoon, late, inProgress],
    NOW,
  );

  it('puts a test the student is taking before other open tests', () => {
    expect(groups.now.map((item) => item.id)).toEqual(['p1', 'o1']);
  });

  it('lists upcoming tests soonest first', () => {
    expect(groups.upcoming.map((item) => item.id)).toEqual(['u1', 'u2']);
  });

  it('separates missed tests that can still be taken', () => {
    expect(groups.late.map((item) => item.id)).toEqual(['l1']);
  });

  it('lists past tests most recent first', () => {
    expect(groups.past.map((item) => item.id)).toEqual(['d1', 'm1']);
  });
});

describe('results', () => {
  it('rounds the percentage', () => {
    expect(scorePercent(17, 20)).toBe(85);
    expect(scorePercent(1, 3)).toBe(33);
    expect(scorePercent(0, 0)).toBe(0);
  });

  it('passes exactly at the pass mark and fails just below it', () => {
    expect(testOutcome(10, 20, 50)).toBe('passed');
    expect(testOutcome(9, 20, 50)).toBe('failed');
  });

  it('does not let rounding turn a fail into a pass', () => {
    // 124 of 250 is 49.6%, which rounds to 50 but is below the pass mark.
    expect(scorePercent(124, 250)).toBe(50);
    expect(testOutcome(124, 250, 50)).toBe('failed');
  });

  it('has no pass or fail when the test has no pass mark', () => {
    expect(testOutcome(3, 20, null)).toBeNull();
  });
});

describe('phaseLine', () => {
  it('says when a test starts and how long it stays open', () => {
    expect(phaseLine(test({ starts_at: iso(48 * HOUR), ends_at: iso(49 * HOUR) }), NOW)).toBe(
      'Starts in 2 days',
    );
    expect(phaseLine(test({ ends_at: iso(40 * 60_000) }), NOW)).toBe(
      'Open now. Closes in 40 minutes',
    );
  });

  it('says how much time is left and what the score was', () => {
    expect(phaseLine(started(), NOW)).toBe('You have 20 minutes left');
    expect(phaseLine(started({ attempt_submitted_at: iso(0), score: 17 }), NOW)).toBe(
      'You scored 17 out of 20',
    );
  });

  it('tells a student who missed a test whether they can still take it', () => {
    const past = { starts_at: iso(-3 * HOUR), ends_at: iso(-HOUR) };
    expect(phaseLine(test(past), NOW)).toBe('You missed this test');
    expect(phaseLine(test({ ...past, allow_late: true }), NOW)).toBe(
      'You missed this test. You can still take it.',
    );
  });
});

describe('other mappers', () => {
  it('turns saved answers into an answer sheet', () => {
    expect(
      toAnswerSheet([
        { question_id: 'q1', selected_option: 2 },
        { question_id: 'q2', selected_option: 0 },
      ]),
    ).toEqual({ q1: 2, q2: 0 });
  });

  it('keeps null scores and ranks of an unfinished attempt', () => {
    const summary = toAttemptSummary({
      attempt_id: 'a1',
      test_id: 't1',
      user_id: 'u1',
      started_at: iso(-60_000),
      deadline_at: iso(HOUR),
      submitted_at: null,
      is_finished: false,
      is_late: false,
      score: null,
      total_marks: 20,
      correct_count: null,
      answered_count: 4,
      question_count: 20,
      time_taken_seconds: 60,
      rank: null,
      rank_out_of: null,
      review_available: false,
      server_now: iso(0),
    });
    expect(summary).toMatchObject({ score: null, rank: null, answeredCount: 4, totalMarks: 20 });
  });

  it('reads the answer key embedded in a question', () => {
    const question = toTestQuestionWithKey({
      id: 'q1',
      position: 0,
      prompt: 'Full form of RAM?',
      options: ['Random Access Memory', 'Read Access Memory'],
      marks: 2,
      test_answer_keys: { correct_option: 0, explanation: 'RAM is Random Access Memory.' },
    });
    expect(question).toMatchObject({
      correctOption: 0,
      explanation: 'RAM is Random Access Memory.',
    });
  });

  it('gives a test without counts zeroes in the admin list', () => {
    const admin = toAdminTest(
      {
        id: 't1',
        title: 'Unit test 1',
        description: '',
        course_id: 'c1',
        duration_minutes: 30,
        starts_at: iso(HOUR),
        ends_at: iso(2 * HOUR),
        allow_late: true,
        show_review: true,
        pass_percent: null,
        is_published: false,
        created_by: null,
        created_at: iso(0),
        updated_at: iso(0),
      },
      undefined,
      'DCA',
    );
    expect(admin).toMatchObject({
      questionCount: 0,
      attemptCount: 0,
      courseTitle: 'DCA',
      isPublished: false,
    });
  });
});
