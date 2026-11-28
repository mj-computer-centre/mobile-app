import { describe, expect, it } from 'vitest';

import { groupCourseOutline } from '../site/outline';
import {
  EMPTY_QUESTION_FORM,
  newTestForm,
  questionFormSchema,
  questionFormToArgs,
  questionToForm,
  testFormSchema,
  testFormToRow,
  testRowToForm,
  type TestFormValues,
} from './test';

const base = newTestForm(new Date(2026, 10, 28, 15, 30));
const valid: TestFormValues = { ...base, title: 'MS Word test' };

function messages(values: TestFormValues): Record<string, string> {
  const result = testFormSchema.safeParse(values);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
  );
}

describe('test form', () => {
  it('starts a new test tomorrow at 10:00 for an hour, as a draft', () => {
    const start = new Date(base.startsAt);
    expect([start.getFullYear(), start.getMonth(), start.getDate()]).toEqual([2026, 10, 29]);
    expect([start.getHours(), start.getMinutes()]).toEqual([10, 0]);
    expect(Date.parse(base.endsAt) - Date.parse(base.startsAt)).toBe(60 * 60_000);
    expect(base.isPublished).toBe(false);
    expect(base.allowLate).toBe(false);
  });

  it('accepts a complete form', () => {
    expect(messages(valid)).toEqual({});
  });

  it('needs a name', () => {
    expect(messages({ ...valid, title: '  ' })).toEqual({ title: 'Enter the test name' });
  });

  it('refuses a test that ends before it starts', () => {
    expect(messages({ ...valid, endsAt: valid.startsAt })).toEqual({
      endsAt: 'The test must end after it starts',
    });
  });

  it('refuses more minutes than the test is open for', () => {
    expect(messages({ ...valid, durationMinutes: '90' }).durationMinutes).toContain(
      'more minutes than the test is open for',
    );
    expect(messages({ ...valid, durationMinutes: '60' })).toEqual({});
  });

  it('refuses a duration that is not a whole number of minutes in range', () => {
    for (const durationMinutes of ['', '0', '2.5', 'ten', '301']) {
      expect(messages({ ...valid, durationMinutes }).durationMinutes).toBeDefined();
    }
  });

  it('accepts an empty pass mark and refuses one above 100', () => {
    expect(messages({ ...valid, passPercent: '' })).toEqual({});
    expect(messages({ ...valid, passPercent: '40' })).toEqual({});
    expect(messages({ ...valid, passPercent: '140' }).passPercent).toBeDefined();
  });

  it('maps the form to a row and back', () => {
    const row = testFormToRow({
      ...valid,
      title: '  MS Word test ',
      courseId: '',
      passPercent: '40',
      allowLate: true,
    });
    expect(row).toMatchObject({
      title: 'MS Word test',
      course_id: null,
      duration_minutes: 30,
      pass_percent: 40,
      allow_late: true,
      is_published: false,
    });
    expect(testRowToForm({ ...row, course_id: null, pass_percent: 40 } as never)).toMatchObject({
      title: 'MS Word test',
      courseId: '',
      durationMinutes: '30',
      passPercent: '40',
      allowLate: true,
    });
  });

  it('stores no pass mark as null', () => {
    expect(testFormToRow(valid).pass_percent).toBeNull();
  });
});

describe('question form', () => {
  const question = {
    prompt: 'Full form of RAM?',
    options: ['Random Access Memory', 'Read Access Memory'],
    correctOption: 0,
    marks: '2',
    explanation: '',
  };

  it('accepts a complete question', () => {
    expect(questionFormSchema.safeParse(question).success).toBe(true);
  });

  it('starts with four empty options, which do not pass until filled in', () => {
    expect(EMPTY_QUESTION_FORM.options).toHaveLength(4);
    expect(questionFormSchema.safeParse(EMPTY_QUESTION_FORM).success).toBe(false);
  });

  it('needs two to six options, none blank', () => {
    expect(questionFormSchema.safeParse({ ...question, options: ['Only one'] }).success).toBe(
      false,
    );
    expect(questionFormSchema.safeParse({ ...question, options: ['A', ' '] }).success).toBe(false);
    expect(
      questionFormSchema.safeParse({ ...question, options: ['1', '2', '3', '4', '5', '6', '7'] })
        .success,
    ).toBe(false);
  });

  it('needs the correct answer to be one of the options', () => {
    expect(questionFormSchema.safeParse({ ...question, correctOption: 2 }).success).toBe(false);
  });

  it('needs marks from 1 to 100', () => {
    expect(questionFormSchema.safeParse({ ...question, marks: '0' }).success).toBe(false);
    expect(questionFormSchema.safeParse({ ...question, marks: '101' }).success).toBe(false);
  });

  it('builds the arguments of save_test_question, trimmed', () => {
    expect(
      questionFormToArgs({ ...question, prompt: ' Full form of RAM? ', options: [' A ', 'B'] }),
    ).toEqual({
      p_prompt: 'Full form of RAM?',
      p_options: ['A', 'B'],
      p_correct_option: 0,
      p_marks: 2,
      p_explanation: '',
    });
  });

  it('fills the form from a saved question', () => {
    expect(
      questionToForm({
        id: 'q1',
        position: 0,
        prompt: 'Full form of RAM?',
        options: ['Random Access Memory', 'Read Access Memory'],
        marks: 2,
        correctOption: 0,
        explanation: 'RAM is Random Access Memory.',
      }),
    ).toEqual({ ...question, explanation: 'RAM is Random Access Memory.' });
  });
});

describe('course outline for the website', () => {
  const outline = groupCourseOutline([
    {
      unit_position: 1,
      unit_title: 'MS Excel',
      unit_description: '',
      lesson_position: null,
      lesson_title: null,
      lesson_kind: null,
      duration_seconds: null,
    },
    {
      unit_position: 0,
      unit_title: 'MS Word',
      unit_description: 'Letters and mail merge',
      lesson_position: 1,
      lesson_title: 'MS Word notes',
      lesson_kind: 'pdf',
      duration_seconds: null,
    },
    {
      unit_position: 0,
      unit_title: 'MS Word',
      unit_description: 'Letters and mail merge',
      lesson_position: 0,
      lesson_title: 'Mail merge',
      lesson_kind: 'video',
      duration_seconds: 300,
    },
  ]);

  it('groups lessons into units in teaching order', () => {
    expect(outline.units.map((unit) => unit.label)).toEqual([
      'Unit 1 – MS Word',
      'Unit 2 – MS Excel',
    ]);
    expect(outline.units[0]?.lessons.map((lesson) => lesson.title)).toEqual([
      'Mail merge',
      'MS Word notes',
    ]);
  });

  it('keeps a unit that has no lessons yet', () => {
    expect(outline.units[1]?.lessons).toEqual([]);
  });

  it('counts videos, notes and video time', () => {
    expect(outline).toMatchObject({ videoCount: 1, pdfCount: 1, totalVideoSeconds: 300 });
  });
});
