import { router } from 'expo-router';
import { View } from 'react-native';

import { StaffActions, useStaffRole } from '@/features/auth';
import { routes } from '@/lib/routes';
import { AppText, Button, EmptyState, ErrorState, Screen, spacing } from '@/ui';

import { CourseGrid, CourseGridSkeleton } from '../components/course-grid';
import { useCourses } from '../hooks';

export function CoursesScreen() {
  // Staff see drafts here too (marked as drafts), so a course they have just added is not missing.
  const staff = useStaffRole() !== null;
  const courses = useCourses({ includeDrafts: staff });

  return (
    <Screen
      edges={[]}
      width="wide"
      refreshing={courses.isRefetching}
      onRefresh={() => void courses.refetch()}>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="title" accessibilityRole="header">
          All courses
        </AppText>
        <AppText color="textMuted">Video lessons and PDF notes, unit by unit.</AppText>
      </View>
      <StaffActions note="Students do not see this box, or the courses marked as drafts.">
        <Button
          label="New course"
          icon="plus"
          compact
          onPress={() => router.push(routes.admin.newCourse)}
        />
      </StaffActions>
      {courses.isPending ? (
        <CourseGridSkeleton />
      ) : courses.isError ? (
        <ErrorState error={courses.error} onRetry={() => void courses.refetch()} />
      ) : courses.data.length === 0 ? (
        <EmptyState
          icon="school-outline"
          title="Courses are on their way"
          message={
            staff
              ? 'Press “New course” to add the first one.'
              : 'The centre is adding its first course. Check back soon.'
          }
        />
      ) : (
        <CourseGrid
          courses={courses.data}
          showDraftBadge={staff}
          onOpen={(course) => router.push(routes.course(course.id))}
        />
      )}
    </Screen>
  );
}
