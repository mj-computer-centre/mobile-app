import { useLocalSearchParams } from 'expo-router';

import { CourseScreen } from '@/features/catalog';

export default function CourseRoute() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  return <CourseScreen courseId={courseId} />;
}
