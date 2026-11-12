import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { CourseCard, useBanners, useCourses } from '@/features/catalog';
import { useMyProfile } from '@/features/profile';
import { routes } from '@/lib/routes';
import { AppText, Button, EmptyState, ErrorState, LoadingState, Screen, spacing } from '@/ui';

import { BannerCarousel } from './banner-carousel';

export function HomeScreen() {
  const profile = useMyProfile();
  const banners = useBanners();
  const courses = useCourses();
  const firstName = profile.data?.full_name?.split(' ')[0];

  return (
    <Screen
      edges={[]}
      refreshing={courses.isRefetching}
      onRefresh={() => {
        void courses.refetch();
        void banners.refetch();
      }}>
      <AppText variant="title">{firstName ? `Namaste, ${firstName}` : 'Namaste'}</AppText>

      {banners.data && banners.data.length > 0 ? <BannerCarousel banners={banners.data} /> : null}

      <AppText variant="heading">Our courses</AppText>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.strip}
          contentContainerStyle={styles.row}>
          {courses.data.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              width={240}
              onPress={() => router.push(routes.course(course.id))}
            />
          ))}
        </ScrollView>
      )}

      <Button
        label="See all courses"
        variant="secondary"
        icon="view-list"
        onPress={() => router.push(routes.courses)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // react-native-web gives ScrollView flexGrow: 1, which stretches a horizontal strip (and
  // its cards) to the screen's full height.
  strip: { flexGrow: 0 },
  row: { gap: spacing.md, alignItems: 'flex-start', paddingRight: spacing.lg },
});
