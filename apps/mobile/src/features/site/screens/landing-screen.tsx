import { formatWindow, type PublicTest } from '@mcc/shared';
import { router } from 'expo-router';
import { Linking, StyleSheet, View } from 'react-native';

import { CourseGrid, useCourses } from '@/features/catalog';
import { ContactActions, useSettings } from '@/features/contact';
import { CalendarLeaf, testSize } from '@/features/tests';
import { PageTitle } from '@/lib/page-title';
import { routes } from '@/lib/routes';
import {
  AppText,
  Button,
  Icon,
  IconChip,
  KeyCap,
  ListGroup,
  SectionHeader,
  spacing,
  Stat,
  useLayout,
  type IconName,
} from '@/ui';

import { CourseKeyboard } from '../components/course-keyboard';
import { Section, SiteBody } from '../components/site-page';
import { useSiteStats, useUpcomingTests } from '../hooks';

const STEPS: { title: string; text: string }[] = [
  {
    title: 'Sign in with Google',
    text: 'One tap with your Gmail. Then tell the centre your name and mobile number.',
  },
  {
    title: 'Pick a course',
    text: 'Every course is split into units, and every unit into short lessons.',
  },
  {
    title: 'Watch, read, take the test',
    text: 'Play the videos, open the notes, and check yourself with a timed test.',
  },
];

const INSIDE: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'play-circle-outline',
    title: 'Lessons play inside the app',
    text: 'Watch, pause and move to the next lesson without being sent to YouTube.',
  },
  {
    icon: 'file-document-outline',
    title: 'Notes for every unit',
    text: 'PDF notes sit next to the videos. In the Android app, a PDF you opened once opens again without internet.',
  },
  {
    icon: 'clipboard-text-clock-outline',
    title: 'Tests on a timer',
    text: 'Take a test in its time window, see your score at once, and check every answer after it ends.',
  },
  {
    icon: 'school-outline',
    title: 'Taught by your own centre',
    text: 'The lessons come from Mishra Computer Centre, arranged unit by unit as the course is taught.',
  },
];

/** The website's home page, for someone who has not signed in. */
export function LandingScreen() {
  const { isWide } = useLayout();
  const courses = useCourses();
  const stats = useSiteStats();
  const tests = useUpcomingTests();
  const settings = useSettings();

  const signIn = () => router.push(routes.signIn);
  const openCourses = () => router.navigate(routes.courses);
  const names = courses.data?.slice(0, 3).map((course) => course.title) ?? [];
  const playStoreUrl = settings.data?.play_store_url;
  const figures = stats.data
    ? [
        { value: stats.data.courses, label: stats.data.courses === 1 ? 'course' : 'courses' },
        { value: stats.data.videos, label: 'video lessons' },
        { value: stats.data.notes, label: 'PDF notes' },
        { value: stats.data.tests, label: stats.data.tests === 1 ? 'test' : 'tests' },
      ].filter((figure) => figure.value > 0)
    : [];

  return (
    <SiteBody>
      <PageTitle
        title="Computer courses in Makhdumpur, Jehanabad"
        description="Video lessons, PDF notes and timed tests for ADCA, DCA, Tally and more from Mishra Computer Centre, Makhdumpur, Jehanabad, Bihar."
      />
      <Section background="hero" style={isWide ? styles.heroWide : styles.heroPhone}>
        <View style={[styles.heroText, isWide && styles.heroTextWide]}>
          <AppText variant={isWide ? 'hero' : 'display'} color="onHero" accessibilityRole="header">
            Computer courses from Mishra Computer Centre, on your phone
          </AppText>
          <AppText color="onHeroMuted" style={styles.lead}>
            {names.length > 0
              ? `Video lessons, PDF notes and timed tests for ${names.join(', ')} and more.`
              : 'Video lessons, PDF notes and timed tests from the centre in Makhdumpur.'}{' '}
            Every course is free right now.
          </AppText>
          <View style={styles.heroActions}>
            <Button
              label="Start learning"
              variant="accent"
              iconAfter="arrow-right"
              onPress={signIn}
            />
            {playStoreUrl ? (
              <Button
                label="Get the Android app"
                variant="secondary"
                icon="google-play"
                onPress={() => void Linking.openURL(playStoreUrl)}
              />
            ) : (
              <Button label="See the courses" variant="secondary" onPress={openCourses} />
            )}
          </View>
        </View>
        <View style={isWide ? styles.heroBoardWide : undefined}>
          <CourseKeyboard
            courses={courses.isError ? [] : courses.data}
            onOpenCourse={(course) => router.push(routes.course(course.id))}
            onOpenCourses={openCourses}
            onOpenTests={() => router.navigate(routes.tests)}
            onStart={signIn}
          />
        </View>
      </Section>

      {figures.length > 0 || (courses.data && courses.data.length > 0) ? (
        <Section>
          {/* What is in the app today, counted from the database. */}
          {figures.length > 0 ? (
            <View style={styles.figures}>
              {figures.map((figure) => (
                <Stat
                  key={figure.label}
                  value={figure.value}
                  label={figure.label}
                  size="lg"
                  style={styles.figure}
                />
              ))}
            </View>
          ) : null}
          {courses.data && courses.data.length > 0 ? (
            <>
              <SectionHeader
                large
                title="Courses"
                description="Open a course to see its units and lessons."
                action={
                  courses.data.length > 3 ? { label: 'See all', onPress: openCourses } : undefined
                }
              />
              <CourseGrid
                courses={courses.data.slice(0, 3)}
                onOpen={(course) => router.push(routes.course(course.id))}
              />
            </>
          ) : null}
        </Section>
      ) : null}

      <Section background="surface">
        <SectionHeader large title="How it works" />
        <View style={[styles.steps, isWide && styles.row]}>
          {STEPS.map((step, index) => (
            <View key={step.title} style={styles.step}>
              <KeyCap legend={String(index + 1)} size={44} tone="primary" />
              <View style={styles.stepText}>
                <AppText variant="subheading">{step.title}</AppText>
                <AppText color="textMuted">{step.text}</AppText>
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Section>
        <SectionHeader large title="What you get" />
        <View style={styles.inside}>
          {INSIDE.map((item) => (
            <View key={item.title} style={[styles.insideItem, isWide && styles.insideItemWide]}>
              <IconChip name={item.icon} size={44} />
              <View style={styles.stepText}>
                <AppText variant="subheading">{item.title}</AppText>
                <AppText color="textMuted">{item.text}</AppText>
              </View>
            </View>
          ))}
        </View>
      </Section>

      {tests.data && tests.data.length > 0 ? (
        <Section background="surface">
          <SectionHeader
            large
            title="Tests coming up"
            description="Sign in to take a test when it opens."
            action={{ label: 'About tests', onPress: () => router.navigate(routes.tests) }}
          />
          <ListGroup>
            {tests.data.slice(0, 3).map((test) => (
              <PublicTestRow key={test.id} test={test} />
            ))}
          </ListGroup>
        </Section>
      ) : null}

      {settings.data && (settings.data.address || settings.data.phone) ? (
        <Section>
          <SectionHeader
            large
            title="Visit the centre"
            action={{ label: 'Contact', onPress: () => router.navigate(routes.contact) }}
          />
          <View style={[styles.visit, isWide && styles.row]}>
            <View style={styles.visitText}>
              {settings.data.address ? (
                <Fact icon="map-marker-outline" text={settings.data.address} />
              ) : null}
              {settings.data.timings ? (
                <Fact icon="clock-outline" text={settings.data.timings} />
              ) : null}
            </View>
            <View style={styles.visitActions}>
              <ContactActions settings={settings.data} />
            </View>
          </View>
        </Section>
      ) : null}
    </SiteBody>
  );
}

/** A test on the public site: when it is, how big it is. Taking it needs sign-in. */
export function PublicTestRow({ test }: { test: PublicTest }) {
  return (
    <View style={styles.testRow}>
      <CalendarLeaf date={test.startsAt} />
      <View style={styles.stepText}>
        <AppText variant="subheading" numberOfLines={2}>
          {test.title}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {formatWindow(test.startsAt, test.endsAt)}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {test.courseTitle ? `${test.courseTitle} · ` : ''}
          {testSize(test)}
        </AppText>
      </View>
    </View>
  );
}

function Fact({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.fact}>
      <Icon name={icon} size={20} color="textMuted" />
      <AppText style={styles.stepText}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  heroPhone: { gap: spacing.xxl },
  heroWide: { flexDirection: 'row', alignItems: 'center', gap: spacing.huge },
  heroText: { gap: spacing.lg },
  heroTextWide: { flex: 1.15, minWidth: 0 },
  heroBoardWide: { flex: 1, minWidth: 0, maxWidth: 460 },
  lead: { fontSize: 17, lineHeight: 26, maxWidth: 560 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  figures: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xxxl, rowGap: spacing.lg },
  figure: { minWidth: 110 },
  steps: { gap: spacing.xl },
  step: { flex: 1, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepText: { flex: 1, gap: spacing.xs / 2, minWidth: 0 },
  inside: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  insideItem: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', width: '100%' },
  insideItemWide: { width: '47%' },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  visit: { gap: spacing.xl },
  visitText: { flex: 1, gap: spacing.md },
  visitActions: { flex: 1 },
  fact: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
});
