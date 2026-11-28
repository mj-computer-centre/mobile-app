/** What the test screens work with. Repositories map database rows into these (mappers.ts). */

export interface TestInfo {
  id: string;
  title: string;
  /** Instructions students read before starting. */
  description: string;
  courseId: string | null;
  courseTitle: string | null;
  durationMinutes: number;
  /** ISO timestamps. A student can start between them. */
  startsAt: string;
  endsAt: string;
  /** Students who missed the window may still take the test (marked late). */
  allowLate: boolean;
  /** Students may see the correct answers after the window ends. */
  showReview: boolean;
  passPercent: number | null;
  questionCount: number;
  totalMarks: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  startedAt: string;
  /** When this student's time runs out. */
  deadlineAt: string;
  submittedAt: string | null;
  isLate: boolean;
}

/** A test as one student sees it: with their attempt and, once finished, their score. */
export interface MyTest extends TestInfo {
  attempt: TestAttempt | null;
  score: number | null;
}

/**
 * Where a test stands for one student.
 * - upcoming: the window has not opened.
 * - open: the window is open and they have not started.
 * - in_progress: they started and their time is still running.
 * - finished: they submitted, or their time ran out.
 * - late_open: the window is over, they did not take it, and late attempts are allowed.
 * - missed: the window is over, they did not take it, and it cannot be taken late.
 */
export type TestPhase = 'upcoming' | 'open' | 'in_progress' | 'finished' | 'late_open' | 'missed';

/** A question as a student answers it: no correct answer. */
export interface TestQuestion {
  id: string;
  position: number;
  prompt: string;
  options: string[];
  marks: number;
}

/** A question as staff edit it. */
export interface TestQuestionWithKey extends TestQuestion {
  correctOption: number;
  explanation: string;
}

/** Selected option per question id. A question the student skipped has no entry. */
export type AnswerSheet = Record<string, number>;

export interface AttemptSummary {
  attemptId: string;
  testId: string;
  userId: string;
  startedAt: string;
  deadlineAt: string;
  submittedAt: string | null;
  isFinished: boolean;
  isLate: boolean;
  /** Null until the attempt is finished. */
  score: number | null;
  correctCount: number | null;
  totalMarks: number;
  answeredCount: number;
  questionCount: number;
  timeTakenSeconds: number;
  /** Place among students who took the test in time; null until the window ends, and for late attempts. */
  rank: number | null;
  rankOutOf: number | null;
  reviewAvailable: boolean;
}

export interface ReviewQuestion extends TestQuestion {
  selectedOption: number | null;
  /** Null only if staff deleted the key, which the staff functions never do. */
  correctOption: number | null;
  explanation: string;
}

/** One row of the staff results list. */
export interface TestResult {
  attemptId: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  startedAt: string;
  submittedAt: string | null;
  isFinished: boolean;
  isLate: boolean;
  score: number;
  correctCount: number;
  answeredCount: number;
  timeTakenSeconds: number;
}

/** A test in the admin list, with counts. */
export interface AdminTest extends TestInfo {
  isPublished: boolean;
  attemptCount: number;
}

/** A test on the public website: titles and times only. */
export interface PublicTest {
  id: string;
  title: string;
  courseTitle: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  questionCount: number;
}
