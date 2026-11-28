import {
  firstVideo,
  formatDuration,
  totalVideoSeconds,
  type CourseDetail,
  type Lesson,
  type Unit,
} from '@mcc/shared';
import { router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { StaffActions } from '@/features/auth';
import { TestRow, useMyTests, useServerNow } from '@/features/tests';
import { routes } from '@/lib/routes';
import {
  AppText,
  Button,
  EmptyState,
  ErrorState,
  Icon,
  ListGroup,
  LoadingState,
  Screen,
  SectionHeader,
  spacing,
  useLayout,
  type IconName,
} from '@/ui';

import { CourseCover } from '../components/course-cover';
import { PriceTag } from '../components/price-tag';
import { UnitList } from '../components/unit-list';
import { useCourseDetail } from '../hooks';

export function CourseScreen({ courseId }: { courseId: string }) {
  const course = useCourseDetail(courseId);
  const { isWide } = useLayout();

  if (course.isPending) return <LoadingState />;
  if (course.isError)
    return <ErrorState error={course.error} onRetry={() => void course.refetch()} />;

  const detail = course.data;
  const start = firstVideo(detail);

  const openLesson = (lesson: Lesson, unit: Unit) => {
    router.push(
      lesson.kind === 'video'
        ? routes.lesson(detail.id, lesson.id, unit.sectionId)
        : routes.notes(detail.id, lesson.id),
    );
  };

  const heading = (
    <View style={styles.heading}>
      <AppText variant="display" accessibilityRole="header">
        {detail.title}
      </AppText>
      {detail.shortDescription ? (
        <AppText color="textMuted">{detail.shortDescription}</AppText>
      ) : null}
      <CourseFacts detail={detail} />
    </View>
  );
  const buy = (
    <View style={styles.buy}>
      <PriceTag
        large
        pricePaise={detail.pricePaise}
        originalPricePaise={detail.originalPricePaise}
      />
      {start ? (
        <Button
          label="Start learning"
          icon="play"
          variant="accent"
          onPress={() => router.push(routes.lesson(detail.id, start.id))}
        />
      ) : null}
    </View>
  );
  const staffKeys = (
    <StaffActions
      note={
        detail.isPublished
          ? 'This is the page students see. Students do not see this box.'
          : 'This course is a draft: only staff can open this page.'
      }>
      <Button
        label="Edit this course"
        icon="pencil-outline"
        variant="secondary"
        compact
        onPress={() => router.push(routes.admin.course(detail.id))}
      />
    </StaffActions>
  );
  const units = (
    <View style={styles.section}>
      <SectionHeader
        title="Units"
        description={detail.units.length > 0 ? 'Open a unit to see its lessons.' : undefined}
      />
      {detail.units.length === 0 ? (
        <EmptyState
          icon="book-open-outline"
          title="Lessons are being added"
          message="The centre has not added lessons to this course yet. Check back soon."
        />
      ) : (
        <UnitList units={detail.units} onOpenLesson={openLesson} />
      )}
    </View>
  );

  return (
    <Screen
      edges={[]}
      width={isWide ? 'wide' : 'narrow'}
      refreshing={course.isRefetching}
      onRefresh={() => void course.refetch()}>
      <Stack.Screen options={{ title: detail.title }} />
      {isWide ? (
        <View style={styles.columns}>
          <View style={styles.main}>
            {heading}
            <CourseTests courseId={detail.id} />
            {units}
          </View>
          <View style={styles.side}>
            <CourseCover title={detail.title} imageUrl={detail.imageUrl} rounded />
            {buy}
            {staffKeys}
            <AboutList detail={detail} />
          </View>
        </View>
      ) : (
        <>
          <CourseCover title={detail.title} imageUrl={detail.imageUrl} rounded />
          {heading}
          {buy}
          {staffKeys}
          <AboutList detail={detail} />
          <CourseTests courseId={detail.id} />
          {units}
        </>
      )}
    </Screen>
  );
}

/** Units, videos, notes and total video time at a glance. */
function CourseFacts({ detail }: { detail: CourseDetail }) {
  const lessons = detail.units.flatMap((unit) => unit.lessons);
  const videos = lessons.filter((lesson) => lesson.kind === 'video').length;
  const pdfs = lessons.length - videos;
  const seconds = totalVideoSeconds(detail);
  const facts: { icon: IconName; text: string }[] = [
    {
      icon: 'view-list-outline',
      text: `${detail.units.length} unit${detail.units.length === 1 ? '' : 's'}`,
    },
  ];
  if (videos)
    facts.push({ icon: 'play-circle-outline', text: `${videos} video${videos === 1 ? '' : 's'}` });
  if (pdfs) facts.push({ icon: 'file-document-outline', text: `${pdfs} PDF notes` });
  if (seconds > 0)
    facts.push({ icon: 'clock-outline', text: `${formatDuration(seconds)} of video` });
  if (detail.durationText)
    facts.push({ icon: 'calendar-month-outline', text: `${detail.durationText} course` });

  return (
    <View style={styles.facts}>
      {facts.map((fact) => (
        <View key={fact.text} style={styles.fact}>
          <Icon name={fact.icon} size={17} color="textMuted" />
          <AppText variant="caption" color="textMuted">
            {fact.text}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** "About this course": the points the centre wrote, as a plain checked list. */
function AboutList({ detail }: { detail: CourseDetail }) {
  if (detail.aboutPoints.length === 0) return null;
  return (
    <View style={styles.section}>
      <AppText variant="heading" accessibilityRole="header">
        About this course
      </AppText>
      <View style={styles.points}>
        {detail.aboutPoints.map((point) => (
          <View key={point} style={styles.point}>
            <Icon name="check-circle" size={19} color="success" />
            <AppText style={styles.pointText}>{point}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Tests the centre attached to this course, with where each stands for this student. */
function CourseTests({ courseId }: { courseId: string }) {
  const tests = useMyTests();
  const now = useServerNow(tests.data?.clockOffsetMs ?? 0);
  const mine = tests.data?.tests.filter((test) => test.courseId === courseId) ?? [];
  if (mine.length === 0) return null;
  return (
    <View style={styles.section}>
      <SectionHeader title="Tests" description="Timed tests for this course." />
      <ListGroup>
        {mine.map((test) => (
          <TestRow
            key={test.id}
            test={test}
            now={now}
            onPress={() => router.push(routes.test(test.id))}
          />
        ))}
      </ListGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.sm },
  facts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.xs },
  fact: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  buy: { gap: spacing.md },
  section: { gap: spacing.md },
  points: { gap: spacing.sm },
  point: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  pointText: { flex: 1 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxxl },
  main: { flex: 3, minWidth: 0, gap: spacing.xxl },
  side: { flex: 2, minWidth: 0, maxWidth: 400, gap: spacing.xl },
});
