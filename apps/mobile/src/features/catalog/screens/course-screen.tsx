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

import { routes } from '@/lib/routes';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Icon,
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
      <AppText variant={isWide ? 'display' : 'title'}>{detail.title}</AppText>
      {detail.shortDescription ? (
        <AppText color="textMuted">{detail.shortDescription}</AppText>
      ) : null}
      <CourseFacts detail={detail} />
    </View>
  );
  const startButton = start ? (
    <Button
      label="Start learning"
      icon="play"
      onPress={() => router.push(routes.lesson(detail.id, start.id))}
    />
  ) : null;
  const units = (
    <View style={styles.units}>
      <SectionHeader
        title="Units"
        description={detail.units.length > 0 ? 'Tap a unit to see its lessons.' : undefined}
      />
      {detail.units.length === 0 ? (
        <EmptyState
          icon="book-open-outline"
          title="Lessons are being added"
          message="Check back soon."
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
            {units}
          </View>
          <View style={styles.side}>
            <Card padded={false}>
              <CourseCover title={detail.title} imageUrl={detail.imageUrl} />
              <View style={styles.sideBody}>
                <PriceTag
                  pricePaise={detail.pricePaise}
                  originalPricePaise={detail.originalPricePaise}
                />
                {startButton}
              </View>
            </Card>
            <AboutCard detail={detail} />
          </View>
        </View>
      ) : (
        <>
          <CourseCover title={detail.title} imageUrl={detail.imageUrl} rounded />
          {heading}
          <PriceTag pricePaise={detail.pricePaise} originalPricePaise={detail.originalPricePaise} />
          {startButton}
          <AboutCard detail={detail} />
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
  if (videos) facts.push({ icon: 'play-circle-outline', text: `${videos} videos` });
  if (pdfs) facts.push({ icon: 'file-document-outline', text: `${pdfs} PDF notes` });
  if (seconds > 0) facts.push({ icon: 'clock-outline', text: formatDuration(seconds) });
  if (detail.durationText)
    facts.push({ icon: 'calendar-month-outline', text: `${detail.durationText} course` });

  return (
    <View style={styles.facts}>
      {facts.map((fact) => (
        <View key={fact.text} style={styles.fact}>
          <Icon name={fact.icon} size={16} color="textMuted" />
          <AppText variant="caption" color="textMuted">
            {fact.text}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function AboutCard({ detail }: { detail: CourseDetail }) {
  const totalSeconds = totalVideoSeconds(detail);
  if (detail.aboutPoints.length === 0 && totalSeconds === 0) return null;
  return (
    <Card>
      <AppText variant="heading" style={styles.cardTitle}>
        About this course
      </AppText>
      {totalSeconds > 0 ? (
        <Point text={`${formatDuration(totalSeconds)} of video lessons`} />
      ) : null}
      {detail.aboutPoints.map((point) => (
        <Point key={point} text={point} />
      ))}
    </Card>
  );
}

function Point({ text }: { text: string }) {
  return (
    <View style={styles.point}>
      <Icon name="check-circle-outline" size={18} color="success" />
      <AppText style={styles.pointText}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.sm },
  facts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.xs },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  units: { gap: spacing.md },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxl },
  main: { flex: 3, minWidth: 0, gap: spacing.xl },
  side: { flex: 2, minWidth: 0, maxWidth: 400, gap: spacing.lg },
  sideBody: { padding: spacing.lg, gap: spacing.md },
  cardTitle: { marginBottom: spacing.sm },
  point: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', paddingVertical: 2 },
  pointText: { flex: 1 },
});
