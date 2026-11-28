import {
  serverClockOffset,
  toAnswerSheet,
  toAttemptSummary,
  toMyTest,
  toReviewQuestion,
  toTestAttempt,
  toTestQuestion,
  type AnswerSheet,
  type AttemptSummary,
  type AttemptSummaryRow,
  type Json,
  type MyTest,
  type MyTestRow,
  type ReviewQuestion,
  type ReviewRow,
  type TestAttempt,
  type TestQuestion,
} from '@mcc/shared';

import { run, runVoid } from '@/lib/data';
import { supabase } from '@/lib/supabase';

export interface MyTestsResult {
  tests: MyTest[];
  /**
   * The server's clock minus this device's, in milliseconds. Tests are timed by the server;
   * screens add this to Date.now() so a wrong phone clock cannot shorten or lengthen a test.
   */
  clockOffsetMs: number;
}

/** Every published test with the caller's own attempt and score. */
export async function fetchMyTests(): Promise<MyTestsResult> {
  const asked = Date.now();
  const rows = (await run(supabase().rpc('my_tests'))) as unknown as MyTestRow[];
  // The answer left the server about halfway between asking and receiving.
  const midpoint = (asked + Date.now()) / 2;
  return {
    tests: rows.map(toMyTest),
    clockOffsetMs: rows[0] ? serverClockOffset(rows[0].server_now, midpoint) : 0,
  };
}

/**
 * Starts the caller's attempt, or returns the one they already have. The server refuses when
 * the test is not open (test_not_open, test_closed) or has no questions.
 */
export async function startTest(testId: string): Promise<TestAttempt> {
  const row = await run(supabase().rpc('start_test', { p_test_id: testId }));
  return toTestAttempt(row);
}

/** What a student needs while answering: the questions and what they have answered so far. */
export interface TestPaper {
  questions: TestQuestion[];
  answers: AnswerSheet;
}

export async function fetchPaper(testId: string, attemptId: string): Promise<TestPaper> {
  const db = supabase();
  const [questions, answers] = await Promise.all([
    run(
      db
        .from('test_questions')
        .select('id, position, prompt, options, marks')
        .eq('test_id', testId)
        .order('position'),
    ),
    run(db.from('test_answers').select('question_id, selected_option').eq('attempt_id', attemptId)),
  ]);
  return { questions: questions.map(toTestQuestion), answers: toAnswerSheet(answers) };
}

/** Answers to save: an option number, or null to clear a question. */
export type AnswerChanges = Record<string, number | null>;

export async function saveAnswers(attemptId: string, changes: AnswerChanges): Promise<void> {
  await runVoid(
    supabase().rpc('save_test_answers', {
      p_attempt_id: attemptId,
      p_answers: changes satisfies Json,
    }),
  );
}

/**
 * Finishes the attempt. Every answer is sent again with it, so answers that could not be saved
 * one by one on a poor connection still count.
 */
export async function submitTest(attemptId: string, answers: AnswerSheet): Promise<TestAttempt> {
  const row = await run(
    supabase().rpc('submit_test', { p_attempt_id: attemptId, p_answers: answers satisfies Json }),
  );
  return toTestAttempt(row);
}

/** Null when the attempt does not exist or belongs to someone else. */
export async function fetchAttemptSummary(attemptId: string): Promise<AttemptSummary | null> {
  const rows = (await run(
    supabase().rpc('test_attempt_summary', { p_attempt_id: attemptId }),
  )) as unknown as AttemptSummaryRow[];
  return rows[0] ? toAttemptSummary(rows[0]) : null;
}

/**
 * Every question with what was chosen and the correct answer. Empty until the caller may see
 * it: check `reviewAvailable` on the summary first.
 */
export async function fetchAttemptReview(attemptId: string): Promise<ReviewQuestion[]> {
  const rows = (await run(
    supabase().rpc('test_attempt_review', { p_attempt_id: attemptId }),
  )) as unknown as ReviewRow[];
  return rows.map(toReviewQuestion);
}
