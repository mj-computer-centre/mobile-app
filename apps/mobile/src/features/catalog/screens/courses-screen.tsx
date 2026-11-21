import { router } from 'expo-router';
import { View } from 'react-native';

import { routes } from '@/lib/routes';
import { AppText, EmptyState, ErrorState, LoadingState, Screen, spacing } from '@/ui';

import { CourseGrid } from '../components/course-grid';
import { useCourses } from '../hooks';

export function CoursesScreen() {
  const courses = useCourses();

  return (
    <Screen
      edges={[]}
      width="wide"
      refreshing={courses.isRefetching}
      onRefresh={() => void courses.refetch()}>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="title">All courses</AppText>
        <AppText color="textMuted">Video lessons and PDF notes, unit by unit.</AppText>
      </View>
      {courses.isPending ? (
        <LoadingState />
      ) : courses.isError ? (
        <ErrorState error={courses.error} onRetry={() => void courses.refetch()} />
      ) : courses.data.length === 0 ? (
        <EmptyState
          icon="school-outline"
          title="Courses are on their way"
          message="Check back soon."
        />
      ) : (
        <CourseGrid
          courses={courses.data}
          onOpen={(course) => router.push(routes.course(course.id))}
        />
      )}
    </Screen>
  );
}
