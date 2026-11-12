import { useLocalSearchParams } from 'expo-router';

import { CourseEditorScreen } from '@/features/admin';

export default function CourseEditorRoute() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  return <CourseEditorScreen courseId={courseId} />;
}
