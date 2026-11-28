import { z } from 'zod';

import type { TableInsert, TableRow } from '../db';
import { MAX_OPTIONS, MIN_OPTIONS } from '../tests/import-questions';
import type { TestQuestionWithKey } from '../tests/types';

export const MAX_TEST_MINUTES = 300;
export const MAX_QUESTIONS = 200;

const wholeNumber = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .refine((value) => /^\d{1,4}$/.test(value) && Number(value) >= min && Number(value) <= max, {
      message,
    });

const isoDate = (message: string) =>
  z.string().refine((value) => value !== '' && Number.isFinite(Date.parse(value)), { message });

/**
 * Test details form. Dates are ISO strings (the date picker produces them); numbers are what
 * the inputs hold (strings).
 */
export const testFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Enter the test name')
      .max(120, 'Keep the name under 120 characters'),
    description: z.string().trim().max(1000, 'Keep the instructions under 1,000 characters'),
    courseId: z.string(),
    startsAt: isoDate('Choose when the test starts'),
    endsAt: isoDate('Choose when the test ends'),
    durationMinutes: wholeNumber(
      1,
      MAX_TEST_MINUTES,
      `Enter the minutes students get, from 1 to ${MAX_TEST_MINUTES}`,
    ),
    passPercent: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === '' || (/^\d{1,3}$/.test(value) && Number(value) >= 1 && Number(value) <= 100),
        'Enter a percentage from 1 to 100, or leave it empty',
      ),
    allowLate: z.boolean(),
    showReview: z.boolean(),
    isPublished: z.boolean(),
  })
  .superRefine((values, context) => {
    const start = Date.parse(values.startsAt);
    const end = Date.parse(values.endsAt);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return;
    if (end <= start) {
      context.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'The test must end after it starts',
      });
      return;
    }
    const minutes = Number(values.durationMinutes);
    // An attempt stops when the window closes, so a window shorter than the duration would
    // give nobody the full time.
    if (Number.isFinite(minutes) && (end - start) / 60_000 < minutes) {
      context.addIssue({
        code: 'custom',
        path: ['durationMinutes'],
        message:
          'Students get more minutes than the test is open for. Shorten this or move the end time.',
      });
    }
  });

export type TestFormValues = z.infer<typeof testFormSchema>;

/**
 * A new test's starting values: tomorrow from 10:00 to 11:00 by the device's clock, 30 minutes,
 * saved as a draft.
 */
export function newTestForm(now: Date = new Date()): TestFormValues {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60_000);
  return {
    title: '',
    description: '',
    courseId: '',
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    durationMinutes: '30',
    passPercent: '',
    allowLate: false,
    showReview: true,
    isPublished: false,
  };
}

export function testFormToRow(
  values: TestFormValues,
): Omit<TableInsert<'tests'>, 'id' | 'created_by' | 'created_at' | 'updated_at'> {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    course_id: values.courseId || null,
    starts_at: new Date(values.startsAt).toISOString(),
    ends_at: new Date(values.endsAt).toISOString(),
    duration_minutes: Number(values.durationMinutes),
    pass_percent: values.passPercent.trim() === '' ? null : Number(values.passPercent),
    allow_late: values.allowLate,
    show_review: values.showReview,
    is_published: values.isPublished,
  };
}

export function testRowToForm(
  row: Pick<
    TableRow<'tests'>,
    | 'title'
    | 'description'
    | 'course_id'
    | 'starts_at'
    | 'ends_at'
    | 'duration_minutes'
    | 'pass_percent'
    | 'allow_late'
    | 'show_review'
    | 'is_published'
  >,
): TestFormValues {
  return {
    title: row.title,
    description: row.description,
    courseId: row.course_id ?? '',
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    durationMinutes: String(row.duration_minutes),
    passPercent: row.pass_percent === null ? '' : String(row.pass_percent),
    allowLate: row.allow_late,
    showReview: row.show_review,
    isPublished: row.is_published,
  };
}

/** One question in the editor. `correctOption` is the 0-based place of the right answer. */
export const questionFormSchema = z
  .object({
    prompt: z
      .string()
      .trim()
      .min(1, 'Type the question')
      .max(1000, 'Keep the question under 1,000 characters'),
    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, 'Fill in this option or remove it')
          .max(300, 'Keep each option under 300 characters'),
      )
      .min(MIN_OPTIONS, 'Add at least two options')
      .max(MAX_OPTIONS, `A question can have up to ${MAX_OPTIONS} options`),
    correctOption: z.number().int().min(0),
    marks: wholeNumber(1, 100, 'Enter marks from 1 to 100'),
    explanation: z.string().trim().max(1000, 'Keep the explanation under 1,000 characters'),
  })
  .refine((values) => values.correctOption < values.options.length, {
    path: ['correctOption'],
    message: 'Choose which option is correct',
  });

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

export const EMPTY_QUESTION_FORM: QuestionFormValues = {
  prompt: '',
  options: ['', '', '', ''],
  correctOption: 0,
  marks: '1',
  explanation: '',
};

export function questionToForm(question: TestQuestionWithKey): QuestionFormValues {
  return {
    prompt: question.prompt,
    options: [...question.options],
    correctOption: question.correctOption,
    marks: String(question.marks),
    explanation: question.explanation,
  };
}

/** Arguments of the `save_test_question` function, without the ids. */
export function questionFormToArgs(values: QuestionFormValues) {
  return {
    p_prompt: values.prompt.trim(),
    p_options: values.options.map((option) => option.trim()),
    p_correct_option: values.correctOption,
    p_marks: Number(values.marks),
    p_explanation: values.explanation.trim(),
  };
}
