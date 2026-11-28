/**
 * Turns questions pasted as plain text (from Word, WhatsApp or a typed paper) into questions
 * the test editor can save. The format is what teachers already write:
 *
 *   1. Full form of CPU?
 *   A) Central Program Unit
 *   B) Central Processing Unit *
 *   Answer: B            (instead of the star)
 *   Marks: 2             (optional)
 *   Explanation: ...     (optional)
 *
 * Question numbers can be "1.", "1)", "Q1.", "Q 1:" or "Question 1 -". Options can be "A)",
 * "(a)", "a." or "A:", or the Hindi letters (क) (ख) (ग) (घ). Lines that are neither continue
 * the question or the option above them.
 */
export interface ImportedQuestion {
  prompt: string;
  options: string[];
  correctOption: number;
  marks: number;
  explanation: string;
}

export interface ImportProblem {
  /** 1-based place of the question in the pasted text. */
  question: number;
  message: string;
}

export interface ImportResult {
  questions: ImportedQuestion[];
  problems: ImportProblem[];
}

export const MAX_OPTIONS = 6;
export const MIN_OPTIONS = 2;

const HINDI_LETTERS = 'कखगघङच';
const LETTER = `[a-f${HINDI_LETTERS}]`;

const QUESTION_LINE = /^(?:q(?:uestion|ues)?\.?\s*|प्रश्न\s*)?(\d{1,3})\s*[.):\-]\s*(.+)$/i;
const OPTION_LINE = new RegExp(`^[(\\[]?\\s*(${LETTER})\\s*[)\\].:\\-]\\s*(.+)$`, 'i');
const ANSWER_LINE = new RegExp(
  `^(?:ans(?:wer)?|correct(?:\\s+answer)?|right(?:\\s+answer)?|सही\\s+उत्तर|उत्तर)\\s*[:\\-–.]?\\s*[(\\[]?\\s*(${LETTER}|[1-6])\\s*[)\\]]?\\.?$`,
  'i',
);
const MARKS_LINE = /^(?:marks?|अंक)\s*[:\-–]?\s*(\d{1,3})$/i;
const EXPLANATION_LINE = /^(?:explanation|reason|solution|व्याख्या)\s*[:\-–]\s*(.+)$/i;
// A star or tick at either end of an option marks it correct.
const LEADING_MARK = /^(?:\*|✓|✔)\s*/;
const TRAILING_MARK = /\s*(?:\*|✓|✔|\(correct\))$/i;

interface Draft {
  prompt: string;
  options: string[];
  correctOptions: number[];
  marks: number;
  explanation: string;
}

/** "b" → 1, "ख" → 1, "2" → 1. */
function optionIndex(label: string): number {
  if (/\d/.test(label)) return Number(label) - 1;
  const hindi = HINDI_LETTERS.indexOf(label);
  return hindi >= 0 ? hindi : label.toLowerCase().charCodeAt(0) - 97;
}

function finish(draft: Draft, number: number, result: ImportResult): void {
  const problem = (message: string) => result.problems.push({ question: number, message });
  const correct = [...new Set(draft.correctOptions)];
  const answer = correct[0] ?? -1;

  if (draft.options.length < MIN_OPTIONS) {
    problem('Needs at least two options, each on its own line starting with A), B)…');
  } else if (draft.options.length > MAX_OPTIONS) {
    problem(`Has ${draft.options.length} options. A question can have up to ${MAX_OPTIONS}.`);
  } else if (correct.length === 0) {
    problem('No correct answer. Put * after the right option, or add a line like “Answer: B”.');
  } else if (correct.length > 1) {
    problem('More than one correct answer is marked. Mark only one.');
  } else if (answer < 0 || answer >= draft.options.length) {
    problem('The answer line names an option this question does not have.');
  } else {
    result.questions.push({
      prompt: draft.prompt.trim(),
      options: draft.options.map((option) => option.trim()),
      correctOption: answer,
      marks: Math.min(100, Math.max(1, draft.marks)),
      explanation: draft.explanation.trim(),
    });
  }
}

export function parseQuestionsText(text: string): ImportResult {
  const result: ImportResult = { questions: [], problems: [] };
  let draft: Draft | null = null;
  let count = 0;
  let lastTarget: 'prompt' | 'option' | 'explanation' = 'prompt';

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (draft) {
      const answer = ANSWER_LINE.exec(line);
      if (answer?.[1]) {
        draft.correctOptions.push(optionIndex(answer[1]));
        continue;
      }
      const marks = MARKS_LINE.exec(line);
      if (marks?.[1]) {
        draft.marks = Number(marks[1]);
        continue;
      }
      const explanation = EXPLANATION_LINE.exec(line);
      if (explanation?.[1]) {
        draft.explanation = explanation[1];
        lastTarget = 'explanation';
        continue;
      }
      // "A) …" is an option only as the next letter in order, so a sentence that happens to
      // start with "A." or "D." does not split the text above it.
      const option = OPTION_LINE.exec(line);
      if (option?.[1] && option[2] && optionIndex(option[1]) === draft.options.length) {
        const optionText = option[2];
        if (LEADING_MARK.test(optionText) || TRAILING_MARK.test(optionText)) {
          draft.correctOptions.push(draft.options.length);
        }
        draft.options.push(optionText.replace(LEADING_MARK, '').replace(TRAILING_MARK, ''));
        lastTarget = 'option';
        continue;
      }
    }

    // A numbered line starts a new question once the current one has its options. Before
    // that it belongs to the question text ("1. Statement one" inside a question).
    const question = QUESTION_LINE.exec(line);
    if (question?.[2] && (!draft || draft.options.length > 0)) {
      if (draft) finish(draft, count, result);
      count += 1;
      draft = { prompt: question[2], options: [], correctOptions: [], marks: 1, explanation: '' };
      lastTarget = 'prompt';
      continue;
    }

    if (!draft) continue; // a heading above the first question
    const last = draft.options.length - 1;
    if (lastTarget === 'explanation') {
      draft.explanation += ` ${line}`;
    } else if (lastTarget === 'option' && last >= 0) {
      // The star can come at the end of an option that runs over two lines.
      if (TRAILING_MARK.test(line)) draft.correctOptions.push(last);
      draft.options[last] = `${draft.options[last]} ${line.replace(TRAILING_MARK, '')}`;
    } else {
      draft.prompt += `\n${line}`;
    }
  }

  if (draft) finish(draft, count, result);
  return result;
}

/** The example shown in the import box, so the format never has to be explained in words. */
export const IMPORT_EXAMPLE = `1. Full form of CPU?
A) Central Program Unit
B) Central Processing Unit *
C) Control Panel Unit

2. Which key erases the letter before the cursor?
A) Delete
B) Backspace
C) Esc
Answer: B
Marks: 2`;
