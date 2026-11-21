import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { CourseCard, CourseGrid, useBanners, useCourses } from '@/features/catalog';
import { useMyProfile } from '@/features/profile';
import { routes } from '@/lib/routes';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionHeader,
  spacing,
  useLayout,
} from '@/ui';

import { BannerCarousel } from './banner-carousel';
import { WelcomeCard } from './welcome-card';

export function HomeScreen() {
  const profile = useMyProfile();
  const banners = useBanners();
  const courses = useCourses();
  const { isWide } = useLayout();
  const firstName = profile.data?.full_name?.split(' ')[0];

  return (
    <Screen
      edges={[]}
      width="wide"
      refreshing={courses.isRefetching}
      onRefresh={() => {
        void courses.refetch();
        void banners.refetch();
      }}>
      <WelcomeCard
        firstName={firstName}
        courseCount={courses.data?.length}
        onBrowse={() => router.push(routes.courses)}
      />

      {banners.data && banners.data.length > 0 ? <BannerCarousel banners={banners.data} /> : null}

      <SectionHeader
        title="Our courses"
        description="Free video lessons and notes from the centre"
        action={{ label: 'See all', onPress: () => router.push(routes.courses) }}
      />
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
      ) : isWide ? (
        <CourseGrid
          courses={courses.data.slice(0, 6)}
          onOpen={(course) => router.push(routes.course(course.id))}
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.strip}
          contentContainerStyle={styles.row}>
          {courses.data.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              width={260}
              onPress={() => router.push(routes.course(course.id))}
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // react-native-web gives ScrollView flexGrow: 1, which stretches a horizontal strip (and
  // its cards) to the screen's full height.
  strip: { flexGrow: 0, overflow: 'visible' },
  row: { gap: spacing.md, alignItems: 'stretch', paddingRight: spacing.lg, paddingBottom: 4 },
});
