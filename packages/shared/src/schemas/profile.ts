import { z } from 'zod';

import type { TableUpdate } from '../db';
import { normalizeIndianMobile } from '../profile/phone';

/** The one-time form after Google sign-in. Values are what the inputs hold (strings). */
export const completeProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Enter your name')
    .max(120, 'Keep your name under 120 characters'),
  phone: z
    .string()
    .trim()
    .refine((value) => normalizeIndianMobile(value) !== null, 'Enter a 10-digit mobile number'),
  city: z.string().trim().max(80, 'Keep this under 80 characters'),
  interestedCourseId: z.string(),
});

export type CompleteProfileValues = z.infer<typeof completeProfileSchema>;

export function completeProfileToUpdate(
  values: CompleteProfileValues,
  now: Date = new Date(),
): TableUpdate<'profiles'> {
  return {
    full_name: values.fullName.trim(),
    phone: normalizeIndianMobile(values.phone),
    city: values.city.trim() || null,
    interested_course_id: values.interestedCourseId || null,
    profile_completed_at: now.toISOString(),
  };
}
