import { router } from 'expo-router';

import { routes } from '@/lib/routes';
import { AppText, EmptyState, ErrorState, LoadingState, Screen } from '@/ui';

import { CourseCard } from '../components/course-card';
import { useCourses } from '../hooks';

export function CoursesScreen() {
  const courses = useCourses();

  return (
    <Screen edges={[]} refreshing={courses.isRefetching} onRefresh={() => void courses.refetch()}>
      <AppText variant="title">All courses</AppText>
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
        courses.data.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onPress={() => router.push(routes.course(course.id))}
          />
        ))
      )}
    </Screen>
  );
}
