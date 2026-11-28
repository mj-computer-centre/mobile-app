import { describe, expect, it } from 'vitest';

import { IMPORT_EXAMPLE, parseQuestionsText } from './import-questions';

describe('parseQuestionsText', () => {
  it('reads the example shown in the import box', () => {
    const { questions, problems } = parseQuestionsText(IMPORT_EXAMPLE);
    expect(problems).toEqual([]);
    expect(questions).toEqual([
      {
        prompt: 'Full form of CPU?',
        options: ['Central Program Unit', 'Central Processing Unit', 'Control Panel Unit'],
        correctOption: 1,
        marks: 1,
        explanation: '',
      },
      {
        prompt: 'Which key erases the letter before the cursor?',
        options: ['Delete', 'Backspace', 'Esc'],
        correctOption: 1,
        marks: 2,
        explanation: '',
      },
    ]);
  });

  it('accepts the ways teachers number questions and letter options', () => {
    const { questions, problems } = parseQuestionsText(`
      Q1) First?
      (a) Yes *
      (b) No
      Question 2 - Second?
      a. Yes
      b. No ✓
      Q.3: Third?
      A: Yes
      B: No
      Ans: (a)
    `);
    expect(problems).toEqual([]);
    expect(questions.map((question) => question.prompt)).toEqual(['First?', 'Second?', 'Third?']);
    expect(questions.map((question) => question.correctOption)).toEqual([0, 1, 0]);
  });

  it('reads Hindi option letters and answer lines', () => {
    const { questions, problems } = parseQuestionsText(`
      प्रश्न 1. कंप्यूटर का मस्तिष्क किसे कहते हैं?
      (क) मॉनिटर
      (ख) सीपीयू
      (ग) कीबोर्ड
      (घ) माउस
      उत्तर: ख
    `);
    expect(problems).toEqual([]);
    expect(questions[0]).toMatchObject({
      prompt: 'कंप्यूटर का मस्तिष्क किसे कहते हैं?',
      options: ['मॉनिटर', 'सीपीयू', 'कीबोर्ड', 'माउस'],
      correctOption: 1,
    });
  });

  it('accepts the answer as a number and keeps an explanation', () => {
    const { questions } = parseQuestionsText(`
      1. Ctrl+Z does what?
      A) Undo
      B) Zoom
      Correct answer: 1
      Explanation: Z is the undo shortcut
      in almost every program.
    `);
    expect(questions[0]).toMatchObject({
      correctOption: 0,
      explanation: 'Z is the undo shortcut in almost every program.',
    });
  });

  it('joins a question or an option that runs over several lines', () => {
    const { questions, problems } = parseQuestionsText(`
      1. Read the statements:
      1. RAM is permanent memory.
      2. ROM is permanent memory.
      Which is true?
      A) Only the first
      B) Only the second,
         because ROM keeps its data *
    `);
    expect(problems).toEqual([]);
    expect(questions[0]?.prompt).toBe(
      'Read the statements:\n1. RAM is permanent memory.\n2. ROM is permanent memory.\nWhich is true?',
    );
    expect(questions[0]?.options[1]).toBe('Only the second, because ROM keeps its data');
    expect(questions[0]?.correctOption).toBe(1);
  });

  it('does not mistake a sentence starting with a letter and a dot for an option', () => {
    const { questions, problems } = parseQuestionsText(`
      1. Who was called the Missile Man of India?
      A) C. V. Raman
      B) A. P. J. Abdul Kalam *
      D. is not an option because C is missing
    `);
    expect(problems).toEqual([]);
    expect(questions[0]?.options).toEqual([
      'C. V. Raman',
      'A. P. J. Abdul Kalam D. is not an option because C is missing',
    ]);
  });

  it('ignores a heading above the first question and blank lines', () => {
    const { questions, problems } = parseQuestionsText(`
      MS Word test, 30 Nov

      1. Shortcut for bold?

      A) Ctrl+B *
      B) Ctrl+I
    `);
    expect(problems).toEqual([]);
    expect(questions).toHaveLength(1);
  });

  it('reports a question with no correct answer, by its place in the text', () => {
    const { questions, problems } = parseQuestionsText(`
      1. Fine?
      A) Yes *
      B) No
      2. No answer marked?
      A) Yes
      B) No
    `);
    expect(questions).toHaveLength(1);
    expect(problems).toEqual([
      {
        question: 2,
        message: 'No correct answer. Put * after the right option, or add a line like “Answer: B”.',
      },
    ]);
  });

  it('reports two correct answers, too few options and an answer that does not exist', () => {
    const { questions, problems } = parseQuestionsText(`
      1. Two stars?
      A) Yes *
      B) No *
      2. One option?
      A) Only *
      3. Wrong letter?
      A) Yes
      B) No
      Answer: D
    `);
    expect(questions).toEqual([]);
    expect(problems.map((problem) => problem.question)).toEqual([1, 2, 3]);
    expect(problems[0]?.message).toContain('More than one');
    expect(problems[1]?.message).toContain('at least two options');
    expect(problems[2]?.message).toContain('does not have');
  });

  it('returns nothing for empty text', () => {
    expect(parseQuestionsText('  \n \n')).toEqual({ questions: [], problems: [] });
  });

  it('keeps marks between 1 and 100', () => {
    const { questions } = parseQuestionsText(`
      1. Heavy?
      A) Yes *
      B) No
      Marks: 500
    `);
    expect(questions[0]?.marks).toBe(100);
  });
});
