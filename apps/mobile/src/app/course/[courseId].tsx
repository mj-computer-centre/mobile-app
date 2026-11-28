import { useLocalSearchParams } from 'expo-router';

import { useIsSignedIn } from '@/features/auth';
import { CourseScreen } from '@/features/catalog';
import { SiteCourseScreen } from '@/features/site';

/** The course with its lessons for someone signed in; its outline for a visitor on the website. */
export default function CourseRoute() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  return useIsSignedIn() ? (
    <CourseScreen courseId={courseId} />
  ) : (
    <SiteCourseScreen courseId={courseId} />
  );
}
