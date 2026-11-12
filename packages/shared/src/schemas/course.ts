import { z } from 'zod';

import type { TableRow, TableUpdate } from '../db';
import { paiseToRupees, rupeesToPaise } from '../money/inr';

export const MAX_ABOUT_POINTS = 12;

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Course details form. "About this course" points are typed one per line. */
export const courseFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Enter the course name')
    .max(120, 'Keep the name under 120 characters'),
  shortDescription: z.string().trim().max(500, 'Keep the description under 500 characters'),
  durationText: z.string().trim().max(40, 'Keep this short, like “12 months”'),
  originalPriceRupees: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{1,7}$/.test(value), 'Enter whole rupees, like 14999'),
  aboutPointsText: z
    .string()
    .refine(
      (text) => splitLines(text).length <= MAX_ABOUT_POINTS,
      `Up to ${MAX_ABOUT_POINTS} points`,
    )
    .refine(
      (text) => splitLines(text).every((line) => line.length <= 120),
      'Keep each point under 120 characters',
    ),
  isPublished: z.boolean(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const EMPTY_COURSE_FORM: CourseFormValues = {
  title: '',
  shortDescription: '',
  durationText: '',
  originalPriceRupees: '',
  aboutPointsText: '',
  isPublished: false,
};

export function courseFormToRow(
  values: CourseFormValues,
): TableUpdate<'courses'> & { title: string } {
  return {
    title: values.title.trim(),
    short_description: values.shortDescription.trim(),
    duration_text: values.durationText.trim(),
    original_price_paise: values.originalPriceRupees
      ? rupeesToPaise(Number(values.originalPriceRupees))
      : null,
    about_points: splitLines(values.aboutPointsText),
    is_published: values.isPublished,
  };
}

export function courseRowToForm(
  row: Pick<
    TableRow<'courses'>,
    | 'title'
    | 'short_description'
    | 'duration_text'
    | 'original_price_paise'
    | 'about_points'
    | 'is_published'
  >,
): CourseFormValues {
  return {
    title: row.title,
    shortDescription: row.short_description,
    durationText: row.duration_text,
    originalPriceRupees:
      row.original_price_paise === null ? '' : String(paiseToRupees(row.original_price_paise)),
    aboutPointsText: row.about_points.join('\n'),
    isPublished: row.is_published,
  };
}
