// Demo tests for the dev-bypass mode (see src/lib/dev-bypass.ts): one in every state a student
// can meet, timed from the moment the app starts. Development only; never in a release bundle.
import type {
  AdminTest,
  AttemptSummary,
  MyTest,
  PublicTest,
  ReviewQuestion,
  TableRow,
  TestAttempt,
  TestQuestionWithKey,
  TestResult,
} from '@mcc/shared';

import { demoId } from './demo-content';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** The demo student's id in results; matches DEV_USER_ID in lib/dev-bypass.ts. */
const DEMO_USER = '00000000-0000-4000-8000-0000000000d1';

export const demoQuestions: TestQuestionWithKey[] = [
  {
    id: demoId(501),
    position: 0,
    prompt: 'What is the full form of CPU?',
    options: [
      'Central Program Unit',
      'Central Processing Unit',
      'Control Panel Unit',
      'Computer Personal Unit',
    ],
    marks: 1,
    correctOption: 1,
    explanation: 'The CPU, or Central Processing Unit, is the part that carries out instructions.',
  },
  {
    id: demoId(502),
    position: 1,
    prompt: 'Which of these is an input device?',
    options: ['Monitor', 'Printer', 'Keyboard', 'Speaker'],
    marks: 1,
    correctOption: 2,
    explanation: 'A keyboard sends what you type into the computer.',
  },
  {
    id: demoId(503),
    position: 2,
    prompt: 'Which shortcut copies the selected text?',
    options: ['Ctrl + V', 'Ctrl + C', 'Ctrl + X', 'Ctrl + Z'],
    marks: 1,
    correctOption: 1,
    explanation: '',
  },
  {
    id: demoId(504),
    position: 3,
    prompt: 'In MS Word, which feature sends the same letter to many people with their own names?',
    options: ['Mail merge', 'Track changes', 'Word count', 'Page break'],
    marks: 2,
    correctOption: 0,
    explanation: 'Mail merge fills one letter with names and addresses from a list.',
  },
  {
    id: demoId(505),
    position: 4,
    prompt: 'RAM keeps its data when the computer is switched off.',
    options: ['True', 'False'],
    marks: 1,
    correctOption: 1,
    explanation: 'RAM is cleared when the power goes; storage such as a hard disk keeps data.',
  },
];

const TOTAL_MARKS = demoQuestions.reduce((sum, question) => sum + question.marks, 0);

interface DemoTest {
  id: string;
  title: string;
  courseId: string | null;
  courseTitle: string | null;
  durationMinutes: number;
  startOffset: number;
  endOffset: number;
  allowLate: boolean;
  isPublished: boolean;
  attempt?: { id: string; startedOffset: number; deadlineOffset: number; submittedOffset?: number };
  score?: number;
}

const TESTS: DemoTest[] = [
  {
    id: demoId(401),
    title: 'MS Word unit test',
    courseId: demoId(2),
    courseTitle: 'DCA',
    durationMinutes: 30,
    startOffset: -20 * MINUTE,
    endOffset: 40 * MINUTE,
    allowLate: false,
    isPublished: true,
  },
  {
    id: demoId(402),
    title: 'Internet basics quiz',
    courseId: null,
    courseTitle: null,
    durationMinutes: 15,
    startOffset: -HOUR,
    endOffset: 2 * HOUR,
    allowLate: false,
    isPublished: true,
    attempt: { id: demoId(602), startedOffset: -3 * MINUTE, deadlineOffset: 12 * MINUTE },
  },
  {
    id: demoId(403),
    title: 'Computer Fundamentals weekly test',
    courseId: demoId(1),
    courseTitle: 'Basic Computer',
    durationMinutes: 45,
    startOffset: 2 * DAY,
    endOffset: 2 * DAY + HOUR,
    allowLate: true,
    isPublished: true,
  },
  {
    id: demoId(404),
    title: 'Typing and shortcuts quiz',
    courseId: null,
    courseTitle: null,
    durationMinutes: 20,
    startOffset: -DAY - HOUR,
    endOffset: -DAY,
    allowLate: true,
    isPublished: true,
  },
  {
    id: demoId(405),
    title: 'Excel basics test',
    courseId: demoId(2),
    courseTitle: 'DCA',
    durationMinutes: 30,
    startOffset: -3 * DAY - HOUR,
    endOffset: -3 * DAY,
    allowLate: false,
    isPublished: true,
    attempt: {
      id: demoId(605),
      startedOffset: -3 * DAY - 50 * MINUTE,
      deadlineOffset: -3 * DAY - 20 * MINUTE,
      submittedOffset: -3 * DAY - 32 * MINUTE,
    },
    score: 4,
  },
  {
    id: demoId(406),
    title: 'Tally Prime vouchers test',
    courseId: demoId(3),
    courseTitle: 'ADCA',
    durationMinutes: 30,
    startOffset: -6 * DAY - HOUR,
    endOffset: -6 * DAY,
    allowLate: false,
    isPublished: true,
  },
  // A draft: staff see it, students do not.
  {
    id: demoId(407),
    title: 'PowerPoint practice test',
    courseId: demoId(3),
    courseTitle: 'ADCA',
    durationMinutes: 30,
    startOffset: 5 * DAY,
    endOffset: 5 * DAY + HOUR,
    allowLate: false,
    isPublished: false,
  },
];

export interface DemoTestData {
  myTests: MyTest[];
  adminTests: AdminTest[];
  records: TableRow<'tests'>[];
  publicTests: PublicTest[];
  /** The attempt in progress, whose questions the runner shows. */
  running: { testId: string; attemptId: string; answers: Record<string, number> };
  /** The finished attempt, with its result and review. */
  finished: { testId: string; summary: AttemptSummary; review: ReviewQuestion[] };
  results: TestResult[];
}

export function buildDemoTests(now: number): DemoTestData {
  const iso = (offset: number) => new Date(now + offset).toISOString();
  const info = (test: DemoTest) => ({
    id: test.id,
    title: test.title,
    description:
      'Read each question carefully. You can change an answer any time before you submit.',
    courseId: test.courseId,
    courseTitle: test.courseTitle,
    durationMinutes: test.durationMinutes,
    startsAt: iso(test.startOffset),
    endsAt: iso(test.endOffset),
    allowLate: test.allowLate,
    showReview: true,
    passPercent: 40,
    questionCount: demoQuestions.length,
    totalMarks: TOTAL_MARKS,
  });
  const attemptOf = (test: DemoTest): TestAttempt | null =>
    test.attempt
      ? {
          id: test.attempt.id,
          testId: test.id,
          startedAt: iso(test.attempt.startedOffset),
          deadlineAt: iso(test.attempt.deadlineOffset),
          submittedAt:
            test.attempt.submittedOffset === undefined ? null : iso(test.attempt.submittedOffset),
          isLate: false,
        }
      : null;

  const running = TESTS.find((test) => test.id === demoId(402)) as DemoTest;
  const done = TESTS.find((test) => test.id === demoId(405)) as DemoTest;
  const doneAttempt = attemptOf(done) as TestAttempt;
  // The demo student got the fourth question wrong and skipped none.
  const chosen = [1, 2, 1, 2, 1];
  const review: ReviewQuestion[] = demoQuestions.map((question, index) => ({
    id: question.id,
    position: question.position,
    prompt: question.prompt,
    options: question.options,
    marks: question.marks,
    selectedOption: chosen[index] ?? null,
    correctOption: question.correctOption,
    explanation: question.explanation,
  }));
  const correct = review.filter((item) => item.selectedOption === item.correctOption);

  return {
    myTests: TESTS.filter((test) => test.isPublished).map((test) => ({
      ...info(test),
      attempt: attemptOf(test),
      score: test.score ?? null,
    })),
    adminTests: TESTS.map((test, index) => ({
      ...info(test),
      isPublished: test.isPublished,
      attemptCount: test.isPublished && test.endOffset < 0 ? 3 : index === 1 ? 1 : 0,
    })),
    records: TESTS.map((test) => ({
      id: test.id,
      title: test.title,
      description: info(test).description,
      course_id: test.courseId,
      duration_minutes: test.durationMinutes,
      starts_at: iso(test.startOffset),
      ends_at: iso(test.endOffset),
      allow_late: test.allowLate,
      show_review: true,
      pass_percent: 40,
      is_published: test.isPublished,
      created_by: null,
      created_at: iso(-10 * DAY),
      updated_at: iso(-10 * DAY),
    })),
    publicTests: TESTS.filter((test) => test.isPublished && test.endOffset > 0)
      .sort((a, b) => a.startOffset - b.startOffset)
      .map((test) => ({
        id: test.id,
        title: test.title,
        courseTitle: test.courseTitle,
        startsAt: iso(test.startOffset),
        endsAt: iso(test.endOffset),
        durationMinutes: test.durationMinutes,
        questionCount: demoQuestions.length,
      })),
    running: {
      testId: running.id,
      attemptId: running.attempt?.id ?? '',
      answers: { [demoId(501)]: 1, [demoId(502)]: 2 },
    },
    finished: {
      testId: done.id,
      review,
      summary: {
        attemptId: doneAttempt.id,
        testId: done.id,
        userId: DEMO_USER,
        startedAt: doneAttempt.startedAt,
        deadlineAt: doneAttempt.deadlineAt,
        submittedAt: doneAttempt.submittedAt,
        isFinished: true,
        isLate: false,
        score: correct.reduce((sum, item) => sum + item.marks, 0),
        correctCount: correct.length,
        totalMarks: TOTAL_MARKS,
        answeredCount: review.length,
        questionCount: review.length,
        timeTakenSeconds: 18 * 60 + 12,
        rank: 2,
        rankOutOf: 3,
        reviewAvailable: true,
      },
    },
    results: [
      { name: 'Demo Student 1', score: 6, correct: 5, seconds: 14 * 60 + 40, late: false },
      { name: 'Dev Student', score: 4, correct: 4, seconds: 18 * 60 + 12, late: false },
      { name: 'Demo Student 2', score: 3, correct: 3, seconds: 25 * 60, late: true },
    ].map((row, index) => ({
      attemptId: index === 1 ? doneAttempt.id : demoId(610 + index),
      userId: index === 1 ? DEMO_USER : demoId(900 + index),
      fullName: row.name,
      email: `student${index + 1}@example.com`,
      phone: null,
      startedAt: doneAttempt.startedAt,
      submittedAt: doneAttempt.submittedAt,
      isFinished: true,
      isLate: row.late,
      score: row.score,
      correctCount: row.correct,
      answeredCount: demoQuestions.length,
      timeTakenSeconds: row.seconds,
    })),
  };
}
