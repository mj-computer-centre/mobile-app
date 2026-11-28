import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  CourseCard,
  CourseGrid,
  CourseGridSkeleton,
  useBanners,
  useCourses,
} from '@/features/catalog';
import { ContactActions, useSettings } from '@/features/contact';
import { useMyProfile } from '@/features/profile';
import { NextTestCard, pickFeaturedTest, useMyTests, useServerNow } from '@/features/tests';
import { routes } from '@/lib/routes';
import { AppText, EmptyState, ErrorState, Screen, SectionHeader, spacing, useLayout } from '@/ui';

import { BannerCarousel } from './banner-carousel';

export function HomeScreen() {
  const profile = useMyProfile();
  const banners = useBanners();
  const courses = useCourses();
  const tests = useMyTests();
  const settings = useSettings();
  const { isWide } = useLayout();
  const now = useServerNow(tests.data?.clockOffsetMs ?? 0);

  const firstName = profile.data?.full_name?.split(' ')[0];
  const featured = tests.data ? pickFeaturedTest(tests.data.tests, now) : null;
  const courseCount = courses.data?.length ?? 0;

  const greeting = (
    <View style={styles.greeting}>
      <AppText variant="display" accessibilityRole="header">
        {firstName ? `Namaste, ${firstName}` : 'Namaste'}
      </AppText>
      <AppText color="textMuted">
        {courseCount > 0
          ? `${courseCount} course${courseCount === 1 ? '' : 's'} with video lessons, PDF notes and tests.`
          : 'Video lessons, PDF notes and tests from the centre.'}
      </AppText>
    </View>
  );
  const nextTest = featured ? (
    <NextTestCard test={featured} now={now} onOpen={() => router.push(routes.test(featured.id))} />
  ) : null;

  return (
    <Screen
      edges={[]}
      width="wide"
      refreshing={courses.isRefetching}
      onRefresh={() => {
        void courses.refetch();
        void banners.refetch();
        void tests.refetch();
      }}>
      {isWide && nextTest ? (
        <View style={styles.topRow}>
          <View style={styles.topText}>{greeting}</View>
          <View style={styles.topCard}>{nextTest}</View>
        </View>
      ) : (
        <>
          {greeting}
          {nextTest}
        </>
      )}

      {banners.data && banners.data.length > 0 ? <BannerCarousel banners={banners.data} /> : null}

      <View style={styles.section}>
        <SectionHeader
          title="Courses"
          description="Pick one and start with its first lesson."
          action={
            courseCount > 0
              ? { label: 'See all', onPress: () => router.push(routes.courses) }
              : undefined
          }
        />
        {courses.isPending ? (
          <CourseGridSkeleton count={isWide ? 3 : 1} />
        ) : courses.isError ? (
          <ErrorState error={courses.error} onRetry={() => void courses.refetch()} />
        ) : courses.data.length === 0 ? (
          <EmptyState
            icon="school-outline"
            title="Courses are on their way"
            message="The centre is adding its first course. Check back soon."
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
            contentContainerStyle={styles.stripRow}>
            {courses.data.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                width={268}
                onPress={() => router.push(routes.course(course.id))}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {settings.data ? (
        <View style={styles.section}>
          <SectionHeader
            title="The centre"
            description={settings.data.timings ?? settings.data.address ?? undefined}
            action={{ label: 'Contact', onPress: () => router.push(routes.contact) }}
          />
          <ContactActions settings={settings.data} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { gap: spacing.xs },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxl },
  topText: { flex: 1, minWidth: 0 },
  topCard: { flex: 1, minWidth: 0, maxWidth: 520 },
  section: { gap: spacing.md },
  // react-native-web gives ScrollView flexGrow: 1, which stretches a horizontal strip (and
  // its cards) to the screen's full height. The strip also reaches the screen's edges, so
  // cards slide out from under the page padding instead of being cut off by it.
  strip: { flexGrow: 0, marginHorizontal: -spacing.lg },
  stripRow: {
    gap: spacing.md,
    alignItems: 'stretch',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
});
