import { firstVideo, formatDuration, totalVideoSeconds, type Lesson, type Unit } from '@mcc/shared';
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
  spacing,
  Thumbnail,
} from '@/ui';

import { PriceTag } from '../components/price-tag';
import { UnitList } from '../components/unit-list';
import { useCourseDetail } from '../hooks';

export function CourseScreen({ courseId }: { courseId: string }) {
  const course = useCourseDetail(courseId);

  if (course.isPending) return <LoadingState />;
  if (course.isError)
    return <ErrorState error={course.error} onRetry={() => void course.refetch()} />;

  const detail = course.data;
  const start = firstVideo(detail);
  const totalSeconds = totalVideoSeconds(detail);

  const openLesson = (lesson: Lesson, unit: Unit) => {
    router.push(
      lesson.kind === 'video'
        ? routes.lesson(detail.id, lesson.id, unit.sectionId)
        : routes.notes(detail.id, lesson.id),
    );
  };

  return (
    <Screen edges={[]} refreshing={course.isRefetching} onRefresh={() => void course.refetch()}>
      <Stack.Screen options={{ title: detail.title }} />
      <Thumbnail
        uri={detail.imageUrl}
        fallbackIcon="school-outline"
        accessibilityLabel={`${detail.title} cover`}
      />

      <View style={styles.heading}>
        <AppText variant="title">{detail.title}</AppText>
        {detail.shortDescription ? (
          <AppText color="textMuted">{detail.shortDescription}</AppText>
        ) : null}
        <PriceTag pricePaise={detail.pricePaise} originalPricePaise={detail.originalPricePaise} />
      </View>

      {start ? (
        <Button
          label="Start learning"
          icon="play"
          onPress={() => router.push(routes.lesson(detail.id, start.id))}
        />
      ) : null}

      {detail.aboutPoints.length > 0 || totalSeconds > 0 ? (
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
      ) : null}

      <AppText variant="heading">Units</AppText>
      {detail.units.length === 0 ? (
        <EmptyState
          icon="book-open-outline"
          title="Lessons are being added"
          message="Check back soon."
        />
      ) : (
        <UnitList units={detail.units} onOpenLesson={openLesson} />
      )}
    </Screen>
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
  cardTitle: { marginBottom: spacing.sm },
  point: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', paddingVertical: 2 },
  pointText: { flex: 1 },
});
