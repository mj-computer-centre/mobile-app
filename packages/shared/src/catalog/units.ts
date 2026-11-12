import type { CourseDetail, Lesson, LessonContext, VideoLesson } from './types';

/** Position is 0-based in the database; people count from 1. */
export function unitLabel(position: number, title: string): string {
  return `Unit ${position + 1} – ${title}`;
}

export function byPosition<T extends { position: number }>(a: T, b: T): number {
  return a.position - b.position;
}

/** Every lesson in the order a student meets them: unit by unit, top to bottom. */
export function lessonsInOrder(course: CourseDetail): { unitIndex: number; lesson: Lesson }[] {
  return course.units.flatMap((unit, unitIndex) =>
    unit.lessons.map((lesson) => ({ unitIndex, lesson })),
  );
}

export function firstVideo(course: CourseDetail): VideoLesson | null {
  for (const { lesson } of lessonsInOrder(course)) {
    if (lesson.kind === 'video') return lesson;
  }
  return null;
}

/**
 * Where a lesson sits in a course and what plays after it. When the same lesson appears in two
 * units of one course, `preferredSectionId` picks the unit the student opened it from.
 */
export function findLessonContext(
  course: CourseDetail,
  lessonId: string,
  preferredSectionId?: string,
): LessonContext | null {
  const ordered = lessonsInOrder(course);
  const matches = ordered
    .map((entry, index) => ({ ...entry, index }))
    .filter((entry) => entry.lesson.id === lessonId);
  const match =
    matches.find((entry) => course.units[entry.unitIndex]?.sectionId === preferredSectionId) ??
    matches[0];
  if (!match) return null;

  const unit = course.units[match.unitIndex];
  if (!unit) return null;

  let nextVideo: VideoLesson | null = null;
  for (const entry of ordered.slice(match.index + 1)) {
    if (entry.lesson.kind === 'video') {
      nextVideo = entry.lesson;
      break;
    }
  }
  return { course, unit, lesson: match.lesson, nextVideo };
}

/** Total minutes of video in a course, for the course page. */
export function totalVideoSeconds(course: CourseDetail): number {
  return lessonsInOrder(course).reduce(
    (sum, { lesson }) => sum + (lesson.kind === 'video' ? (lesson.durationSeconds ?? 0) : 0),
    0,
  );
}
