import {
  formatDateTime,
  formatTimeTaken,
  questionFormToArgs,
  testFormToRow,
  toAdminTest,
  toCsv,
  toTestQuestionWithKey,
  toTestResult,
  type AdminTest,
  type ImportedQuestion,
  type Json,
  type QuestionFormValues,
  type TestFormValues,
  type TestQuestionWithKey,
  type TestQuestionWithKeyRow,
  type TestResult,
  type TestResultRow,
  type TestRow,
} from '@mcc/shared';

import { run, runVoid } from '@/lib/data';
import { saveTextFile } from '@/lib/platform/save-text-file';
import { supabase } from '@/lib/supabase';

export type TestRecord = TestRow;

/** Every test, drafts included, newest window first, with question and attempt counts. */
export async function fetchAdminTests(): Promise<AdminTest[]> {
  const db = supabase();
  const [tests, usage, courses] = await Promise.all([
    run(db.from('tests').select('*').order('starts_at', { ascending: false })),
    run(db.from('test_usage').select('test_id, question_count, total_marks, attempt_count')),
    run(db.from('courses').select('id, title')),
  ]);
  const usageById = new Map(usage.map((row) => [row.test_id, row]));
  const courseTitles = new Map(courses.map((course) => [course.id, course.title]));
  return tests.map((test) =>
    toAdminTest(
      test,
      usageById.get(test.id),
      test.course_id ? (courseTitles.get(test.course_id) ?? null) : null,
    ),
  );
}

export async function fetchTestRecord(testId: string): Promise<TestRecord> {
  return run(supabase().from('tests').select('*').eq('id', testId).single());
}

export async function createTest(values: TestFormValues, createdBy: string): Promise<string> {
  const row = await run(
    supabase()
      .from('tests')
      .insert({ ...testFormToRow(values), created_by: createdBy })
      .select('id')
      .single(),
  );
  return row.id;
}

export async function updateTest(testId: string, values: TestFormValues): Promise<void> {
  await runVoid(supabase().from('tests').update(testFormToRow(values)).eq('id', testId));
}

/** The two switches staff flip without opening the whole form. */
export async function setTestFlags(
  testId: string,
  flags: { isPublished?: boolean; allowLate?: boolean },
): Promise<void> {
  await runVoid(
    supabase()
      .from('tests')
      .update({
        ...(flags.isPublished !== undefined ? { is_published: flags.isPublished } : {}),
        ...(flags.allowLate !== undefined ? { allow_late: flags.allowLate } : {}),
      })
      .eq('id', testId),
  );
}

/** Deletes the test with its questions and every student's attempt at it. */
export async function deleteTest(testId: string): Promise<void> {
  await runVoid(supabase().from('tests').delete().eq('id', testId));
}

export async function fetchTestQuestions(testId: string): Promise<TestQuestionWithKey[]> {
  const rows = (await run(
    supabase()
      .from('test_questions')
      .select('id, position, prompt, options, marks, test_answer_keys(correct_option, explanation)')
      .eq('test_id', testId)
      .order('position'),
  )) as unknown as TestQuestionWithKeyRow[]; // embed shape asserted here, mapped in @mcc/shared
  return rows.map(toTestQuestionWithKey);
}

/** Adds a question at the end (`questionId` null) or changes one. Returns its id. */
export async function saveQuestion(
  testId: string,
  questionId: string | null,
  values: QuestionFormValues,
): Promise<string> {
  return run(
    supabase().rpc('save_test_question', {
      p_test_id: testId,
      // The generated types make every argument not null; null here means "a new question".
      p_question_id: questionId as string,
      ...questionFormToArgs(values),
    }),
  );
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await runVoid(supabase().rpc('delete_test_question', { p_question_id: questionId }));
}

export async function reorderQuestions(testId: string, questionIds: string[]): Promise<void> {
  await runVoid(
    supabase().rpc('reorder_test_questions', { p_test_id: testId, p_question_ids: questionIds }),
  );
}

/** Adds pasted questions in order. All or nothing. Returns how many were added. */
export async function importQuestions(
  testId: string,
  questions: ImportedQuestion[],
): Promise<number> {
  const payload = questions.map((question) => ({
    prompt: question.prompt,
    options: question.options,
    correct_option: question.correctOption,
    marks: question.marks,
    explanation: question.explanation,
  }));
  return run(
    supabase().rpc('import_test_questions', {
      p_test_id: testId,
      p_questions: payload satisfies Json,
    }),
  );
}

/** Everyone who took the test, best score first. */
export async function fetchTestResults(testId: string): Promise<TestResult[]> {
  const rows = (await run(
    supabase().rpc('test_results', { p_test_id: testId }),
  )) as unknown as TestResultRow[];
  return rows.map(toTestResult);
}

/** Deletes one student's attempt, so they can take the test again. */
export async function resetAttempt(attemptId: string): Promise<void> {
  await runVoid(supabase().from('test_attempts').delete().eq('id', attemptId));
}

/** Downloads (web) or shares (phone) a test's results as a CSV that opens in Excel. */
export async function exportResultsCsv(
  test: Pick<AdminTest, 'title' | 'totalMarks'>,
  results: TestResult[],
): Promise<void> {
  const csv = toCsv(results, [
    { header: 'Rank', value: (result) => results.indexOf(result) + 1 },
    { header: 'Name', value: (result) => result.fullName },
    { header: 'Mobile', value: (result) => result.phone },
    { header: 'Email', value: (result) => result.email },
    { header: 'Score', value: (result) => result.score },
    { header: 'Out of', value: () => test.totalMarks },
    { header: 'Correct answers', value: (result) => result.correctCount },
    { header: 'Questions answered', value: (result) => result.answeredCount },
    { header: 'Time taken', value: (result) => formatTimeTaken(result.timeTakenSeconds) },
    { header: 'Started', value: (result) => formatDateTime(result.startedAt) },
    {
      header: 'Status',
      value: (result) =>
        !result.isFinished ? 'Still taking it' : result.isLate ? 'Taken late' : 'On time',
    },
  ]);
  const name = test.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'test';
  await saveTextFile(`results-${name}.csv`, csv, 'text/csv');
}
