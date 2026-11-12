import { z } from 'zod';

import { parseYouTubeUrl } from '../youtube/parse-url';

export const sectionFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Enter the unit name')
    .max(120, 'Keep the name under 120 characters'),
  description: z.string().trim().max(500, 'Keep the description under 500 characters'),
});

export type SectionFormValues = z.infer<typeof sectionFormSchema>;

export const youtubeLinkSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Paste a YouTube link')
    .refine(
      (value) => parseYouTubeUrl(value) !== null,
      'This is not a YouTube video or playlist link',
    ),
});

export type YoutubeLinkValues = z.infer<typeof youtubeLinkSchema>;

export const lessonTitleSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title').max(200, 'Keep the title under 200 characters'),
});

export type LessonTitleValues = z.infer<typeof lessonTitleSchema>;
