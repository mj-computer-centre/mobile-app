import {
  groupCourseOutline,
  toCourseSummary,
  toPublicTest,
  type CourseOutline,
  type CourseOutlineRow,
  type CourseSummary,
  type PublicTest,
  type PublicTestRow,
  type SiteStats,
} from '@mcc/shared';

import { COURSE_FIELDS } from '@/features/catalog';
import { runMaybe, run } from '@/lib/data';
import { fileUrls } from '@/lib/file-urls';
import { supabase } from '@/lib/supabase';

// Everything here works without signing in: the `public_*` database functions return only
// titles and counts (supabase/migrations/20261128000400_public_site.sql).

/** What students can open today. Real counts; the website never shows invented numbers. */
export async function fetchSiteStats(): Promise<SiteStats> {
  const rows = await run(supabase().rpc('public_site_stats'));
  const row = rows[0];
  return {
    courses: row?.courses ?? 0,
    videos: row?.videos ?? 0,
    notes: row?.notes ?? 0,
    tests: row?.tests ?? 0,
  };
}

/** Tests that are running or still to come, soonest first. */
export async function fetchUpcomingTests(): Promise<PublicTest[]> {
  const rows = (await run(supabase().rpc('public_upcoming_tests'))) as unknown as PublicTestRow[];
  return rows.map(toPublicTest);
}

/** Unit and lesson titles of a published course. */
export async function fetchCourseOutline(courseId: string): Promise<CourseOutline> {
  const rows = (await run(
    supabase().rpc('public_course_outline', { p_course_id: courseId }),
  )) as unknown as CourseOutlineRow[];
  return groupCourseOutline(rows);
}

export interface PublicCourse extends CourseSummary {
  aboutPoints: string[];
}

/** A published course as the website shows it. Null when it does not exist or is a draft. */
export async function fetchPublicCourse(courseId: string): Promise<PublicCourse | null> {
  const row = await runMaybe(
    supabase()
      .from('courses')
      .select(`${COURSE_FIELDS}, about_points`)
      .eq('id', courseId)
      .eq('is_published', true)
      .maybeSingle(),
  );
  return row ? { ...toCourseSummary(row, fileUrls()), aboutPoints: row.about_points } : null;
}
