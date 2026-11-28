/**
 * The public website's view of a course: unit and lesson titles, without anything that plays
 * (see supabase/migrations/20261128000400_public_site.sql).
 */
import type { LessonKind } from '../db';
import { unitLabel } from '../catalog/units';

/** A row of the `public_course_outline` function. A unit without lessons has null lesson columns. */
export interface CourseOutlineRow {
  unit_position: number;
  unit_title: string;
  unit_description: string;
  lesson_position: number | null;
  lesson_title: string | null;
  lesson_kind: LessonKind | null;
  duration_seconds: number | null;
}

export interface OutlineLesson {
  title: string;
  kind: LessonKind;
  durationSeconds: number | null;
}

export interface OutlineUnit {
  position: number;
  title: string;
  description: string;
  /** "Unit 3 – MS Word". */
  label: string;
  lessons: OutlineLesson[];
}

export interface CourseOutline {
  units: OutlineUnit[];
  videoCount: number;
  pdfCount: number;
  totalVideoSeconds: number;
}

export function groupCourseOutline(rows: readonly CourseOutlineRow[]): CourseOutline {
  const units = new Map<number, OutlineUnit>();
  const ordered = [...rows].sort(
    (a, b) =>
      a.unit_position - b.unit_position || (a.lesson_position ?? 0) - (b.lesson_position ?? 0),
  );
  for (const row of ordered) {
    let unit = units.get(row.unit_position);
    if (!unit) {
      unit = {
        position: row.unit_position,
        title: row.unit_title,
        description: row.unit_description,
        label: unitLabel(row.unit_position, row.unit_title),
        lessons: [],
      };
      units.set(row.unit_position, unit);
    }
    if (row.lesson_title !== null && row.lesson_kind !== null) {
      unit.lessons.push({
        title: row.lesson_title,
        kind: row.lesson_kind,
        durationSeconds: row.duration_seconds,
      });
    }
  }

  const list = [...units.values()];
  const lessons = list.flatMap((unit) => unit.lessons);
  const videos = lessons.filter((lesson) => lesson.kind === 'video');
  return {
    units: list,
    videoCount: videos.length,
    pdfCount: lessons.length - videos.length,
    totalVideoSeconds: videos.reduce((sum, lesson) => sum + (lesson.durationSeconds ?? 0), 0),
  };
}

/** Numbers shown on the website. All come from the database; none are invented. */
export interface SiteStats {
  courses: number;
  videos: number;
  notes: number;
  tests: number;
}
