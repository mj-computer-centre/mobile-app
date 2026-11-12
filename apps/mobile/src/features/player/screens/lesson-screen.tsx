import { findLessonContext, formatDuration, type Lesson } from '@mcc/shared';
import { Redirect, router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useCourseDetail, LessonRow } from '@/features/catalog';
import { routes } from '@/lib/routes';
import { AppText, Button, Card, EmptyState, ErrorState, LoadingState, Screen, spacing } from '@/ui';

import { LessonPlayer } from '../lesson-player';

export interface LessonScreenProps {
  courseId: string;
  lessonId: string;
  sectionId?: string;
}

export function LessonScreen({ courseId, lessonId, sectionId }: LessonScreenProps) {
  const course = useCourseDetail(courseId);

  if (course.isPending) return <LoadingState />;
  if (course.isError)
    return <ErrorState error={course.error} onRetry={() => void course.refetch()} />;

  const context = findLessonContext(course.data, lessonId, sectionId);
  if (!context) {
    return (
      <EmptyState
        icon="video-off-outline"
        title="This lesson is no longer available"
        action={{
          label: 'Back to the course',
          onPress: () => router.replace(routes.course(courseId)),
        }}
      />
    );
  }
  if (context.lesson.kind === 'pdf') return <Redirect href={routes.notes(courseId, lessonId)} />;

  const { lesson, unit, nextVideo } = context;
  const notes = lesson.notes;
  const playNext = nextVideo
    ? () => router.replace(routes.lesson(courseId, nextVideo.id))
    : undefined;
  const open = (item: Lesson) =>
    router.replace(
      item.kind === 'video'
        ? routes.lesson(courseId, item.id, unit.sectionId)
        : routes.notes(courseId, item.id),
    );

  return (
    <Screen edges={[]} padded={false}>
      <Stack.Screen options={{ title: unit.label }} />
      <LessonPlayer
        videoId={lesson.youtubeVideoId}
        endOverlay={
          nextVideo && playNext ? (
            <View style={styles.overlay}>
              <AppText variant="caption" color="textMuted">
                Up next
              </AppText>
              <AppText variant="label" numberOfLines={2} style={styles.centre}>
                {nextVideo.title}
              </AppText>
              <Button label="Play next" icon="skip-next" compact onPress={playNext} />
            </View>
          ) : (
            <AppText variant="label">You have finished this course’s videos.</AppText>
          )
        }
      />

      <View style={styles.body}>
        <AppText variant="heading">{lesson.title}</AppText>
        {lesson.durationSeconds ? (
          <AppText variant="caption" color="textMuted">
            {formatDuration(lesson.durationSeconds)}
          </AppText>
        ) : null}

        <View style={styles.actions}>
          {notes ? (
            <Button
              label="Open notes"
              icon="file-pdf-box"
              variant="secondary"
              onPress={() => router.push(routes.notes(courseId, notes.id))}
            />
          ) : null}
          {playNext ? (
            <Button label="Next video" icon="skip-next" variant="secondary" onPress={playNext} />
          ) : null}
        </View>

        <AppText variant="heading">{unit.label}</AppText>
        <Card padded={false}>
          {unit.lessons.map((item) => (
            <LessonRow
              key={item.id}
              lesson={item}
              active={item.id === lesson.id}
              onPress={() => open(item)}
            />
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', gap: spacing.sm },
  centre: { textAlign: 'center' },
  body: { padding: spacing.lg, gap: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
