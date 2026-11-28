/**
 * Database rows → screen models for tests. The row types say which columns can be null; the
 * generated types cannot, for functions that return a table (see db/generated).
 */
import type { TableRow, ViewRow } from '../db';
import type {
  AdminTest,
  AnswerSheet,
  AttemptSummary,
  MyTest,
  PublicTest,
  ReviewQuestion,
  TestAttempt,
  TestQuestion,
  TestQuestionWithKey,
  TestResult,
} from './types';

export type TestRow = TableRow<'tests'>;
export type TestAttemptRow = TableRow<'test_attempts'>;

/** A row of the `my_tests` function. */
export interface MyTestRow {
  id: string;
  title: string;
  description: string;
  course_id: string | null;
  course_title: string | null;
  duration_minutes: number;
  starts_at: string;
  ends_at: string;
  allow_late: boolean;
  show_review: boolean;
  pass_percent: number | null;
  question_count: number;
  total_marks: number;
  attempt_id: string | null;
  attempt_started_at: string | null;
  attempt_deadline_at: string | null;
  attempt_submitted_at: string | null;
  attempt_is_late: boolean | null;
  score: number | null;
  server_now: string;
}

export function toTestAttempt(row: TestAttemptRow): TestAttempt {
  return {
    id: row.id,
    testId: row.test_id,
    startedAt: row.started_at,
    deadlineAt: row.deadline_at,
    submittedAt: row.submitted_at,
    isLate: row.is_late,
  };
}

export function toMyTest(row: MyTestRow): MyTest {
  const attempt: TestAttempt | null =
    row.attempt_id && row.attempt_started_at && row.attempt_deadline_at
      ? {
          id: row.attempt_id,
          testId: row.id,
          startedAt: row.attempt_started_at,
          deadlineAt: row.attempt_deadline_at,
          submittedAt: row.attempt_submitted_at,
          isLate: Boolean(row.attempt_is_late),
        }
      : null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    courseId: row.course_id,
    courseTitle: row.course_title,
    durationMinutes: row.duration_minutes,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    allowLate: row.allow_late,
    showReview: row.show_review,
    passPercent: row.pass_percent,
    questionCount: row.question_count,
    totalMarks: row.total_marks,
    attempt,
    score: attempt ? row.score : null,
  };
}

export type TestQuestionRow = Pick<
  TableRow<'test_questions'>,
  'id' | 'position' | 'prompt' | 'options' | 'marks'
>;

export function toTestQuestion(row: TestQuestionRow): TestQuestion {
  return {
    id: row.id,
    position: row.position,
    prompt: row.prompt,
    options: row.options,
    marks: row.marks,
  };
}

/** A question with its key embedded, as staff fetch it. */
export interface TestQuestionWithKeyRow extends TestQuestionRow {
  test_answer_keys: { correct_option: number; explanation: string } | null;
}

export function toTestQuestionWithKey(row: TestQuestionWithKeyRow): TestQuestionWithKey {
  return {
    ...toTestQuestion(row),
    correctOption: row.test_answer_keys?.correct_option ?? 0,
    explanation: row.test_answer_keys?.explanation ?? '',
  };
}

export function toAnswerSheet(
  rows: readonly Pick<TableRow<'test_answers'>, 'question_id' | 'selected_option'>[],
): AnswerSheet {
  const sheet: AnswerSheet = {};
  for (const row of rows) sheet[row.question_id] = row.selected_option;
  return sheet;
}

/** A row of the `test_attempt_summary` function. */
export interface AttemptSummaryRow {
  attempt_id: string;
  test_id: string;
  user_id: string;
  started_at: string;
  deadline_at: string;
  submitted_at: string | null;
  is_finished: boolean;
  is_late: boolean;
  score: number | null;
  total_marks: number;
  correct_count: number | null;
  answered_count: number;
  question_count: number;
  time_taken_seconds: number;
  rank: number | null;
  rank_out_of: number | null;
  review_available: boolean;
  server_now: string;
}

export function toAttemptSummary(row: AttemptSummaryRow): AttemptSummary {
  return {
    attemptId: row.attempt_id,
    testId: row.test_id,
    userId: row.user_id,
    startedAt: row.started_at,
    deadlineAt: row.deadline_at,
    submittedAt: row.submitted_at,
    isFinished: row.is_finished,
    isLate: row.is_late,
    score: row.score,
    correctCount: row.correct_count,
    totalMarks: row.total_marks,
    answeredCount: row.answered_count,
    questionCount: row.question_count,
    timeTakenSeconds: row.time_taken_seconds,
    rank: row.rank,
    rankOutOf: row.rank_out_of,
    reviewAvailable: row.review_available,
  };
}

/** A row of the `test_attempt_review` function. */
export interface ReviewRow {
  question_id: string;
  question_position: number;
  prompt: string;
  options: string[];
  marks: number;
  selected_option: number | null;
  correct_option: number | null;
  explanation: string;
}

export function toReviewQuestion(row: ReviewRow): ReviewQuestion {
  return {
    id: row.question_id,
    position: row.question_position,
    prompt: row.prompt,
    options: row.options,
    marks: row.marks,
    selectedOption: row.selected_option,
    correctOption: row.correct_option,
    explanation: row.explanation,
  };
}

/** A row of the `test_results` function. */
export interface TestResultRow {
  attempt_id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  started_at: string;
  submitted_at: string | null;
  deadline_at: string;
  is_finished: boolean;
  is_late: boolean;
  score: number;
  correct_count: number;
  answered_count: number;
  time_taken_seconds: number;
}

export function toTestResult(row: TestResultRow): TestResult {
  return {
    attemptId: row.attempt_id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
    isFinished: row.is_finished,
    isLate: row.is_late,
    score: row.score,
    correctCount: row.correct_count,
    answeredCount: row.answered_count,
    timeTakenSeconds: row.time_taken_seconds,
  };
}

export function toAdminTest(
  row: TestRow,
  usage: ViewRow<'test_usage'> | undefined,
  courseTitle: string | null,
): AdminTest {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    courseId: row.course_id,
    courseTitle,
    durationMinutes: row.duration_minutes,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    allowLate: row.allow_late,
    showReview: row.show_review,
    passPercent: row.pass_percent,
    questionCount: usage?.question_count ?? 0,
    totalMarks: usage?.total_marks ?? 0,
    isPublished: row.is_published,
    attemptCount: usage?.attempt_count ?? 0,
  };
}

/** A row of the `public_upcoming_tests` function. */
export interface PublicTestRow {
  id: string;
  title: string;
  course_title: string | null;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  question_count: number;
  server_now: string;
}

export function toPublicTest(row: PublicTestRow): PublicTest {
  return {
    id: row.id,
    title: row.title,
    courseTitle: row.course_title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    durationMinutes: row.duration_minutes,
    questionCount: row.question_count,
  };
}
