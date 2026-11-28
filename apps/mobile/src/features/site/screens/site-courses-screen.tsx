import { router } from 'expo-router';
import { View } from 'react-native';

import { CourseGrid, CourseGridSkeleton, useCourses } from '@/features/catalog';
import { PageTitle } from '@/lib/page-title';
import { routes } from '@/lib/routes';
import { AppText, Button, EmptyState, ErrorState, spacing } from '@/ui';

import { Section, SiteBody } from '../components/site-page';

/** The course list on the public website. Opening a course shows its outline. */
export function SiteCoursesScreen() {
  const courses = useCourses();

  return (
    <SiteBody>
      <PageTitle
        title="Courses"
        description="The computer courses of Mishra Computer Centre: units, video lessons and PDF notes."
      />
      <Section>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="display" accessibilityRole="header">
            Courses
          </AppText>
          <AppText color="textMuted">
            Each course is made of units with video lessons and PDF notes. Open one to see what it
            covers.
          </AppText>
        </View>
        {courses.isPending ? (
          <CourseGridSkeleton />
        ) : courses.isError ? (
          <ErrorState error={courses.error} onRetry={() => void courses.refetch()} />
        ) : courses.data.length === 0 ? (
          <EmptyState
            icon="school-outline"
            title="Courses are on their way"
            message="The centre is adding its first course. Check back soon."
          />
        ) : (
          <CourseGrid
            courses={courses.data}
            onOpen={(course) => router.push(routes.course(course.id))}
          />
        )}
        <View style={{ alignSelf: 'flex-start' }}>
          <Button
            label="Sign in to start learning"
            variant="accent"
            iconAfter="arrow-right"
            onPress={() => router.push(routes.signIn)}
          />
        </View>
      </Section>
    </SiteBody>
  );
}
