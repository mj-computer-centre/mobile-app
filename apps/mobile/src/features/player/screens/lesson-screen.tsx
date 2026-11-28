import { findLessonContext, formatDuration, type Lesson } from '@mcc/shared';
import { Redirect, router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useCourseDetail, LessonRow } from '@/features/catalog';
import { routes } from '@/lib/routes';
import {
  AppText,
  Button,
  Divider,
  EmptyState,
  ErrorState,
  LoadingState,
  radius,
  Screen,
  spacing,
  useLayout,
  useTheme,
} from '@/ui';

import { LessonPlayer } from '../lesson-player';

export interface LessonScreenProps {
  courseId: string;
  lessonId: string;
  sectionId?: string;
}

export function LessonScreen({ courseId, lessonId, sectionId }: LessonScreenProps) {
  const course = useCourseDetail(courseId);
  const { isWide } = useLayout();
  const { colors } = useTheme();

  if (course.isPending) return <LoadingState />;
  if (course.isError)
    return <ErrorState error={course.error} onRetry={() => void course.refetch()} />;

  const context = findLessonContext(course.data, lessonId, sectionId);
  if (!context) {
    return (
      <EmptyState
        icon="video-off-outline"
        title="This lesson is no longer available"
        message="The centre may have moved or removed it."
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

  const player = (
    <LessonPlayer
      videoId={lesson.youtubeVideoId}
      endOverlay={
        nextVideo && playNext ? (
          <View style={styles.overlay}>
            <AppText variant="caption" color="onHeroMuted">
              Up next
            </AppText>
            <AppText variant="subheading" color="onHero" numberOfLines={2} style={styles.centre}>
              {nextVideo.title}
            </AppText>
            <Button
              label="Play next"
              icon="skip-next"
              variant="accent"
              compact
              onPress={playNext}
            />
          </View>
        ) : (
          <AppText variant="subheading" color="onHero" style={styles.centre}>
            You have finished this course’s videos.
          </AppText>
        )
      }
    />
  );
  const details = (
    <View style={styles.details}>
      <View style={styles.titles}>
        <AppText variant="title" accessibilityRole="header">
          {lesson.title}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {[unit.label, lesson.durationSeconds ? formatDuration(lesson.durationSeconds) : null]
            .filter(Boolean)
            .join(' · ')}
        </AppText>
      </View>
      {playNext || notes ? (
        <View style={styles.actions}>
          {playNext ? (
            <Button label="Next video" icon="skip-next" onPress={playNext} style={styles.action} />
          ) : null}
          {notes ? (
            <Button
              label="Open notes"
              icon="file-document-outline"
              variant="secondary"
              onPress={() => router.push(routes.notes(courseId, notes.id))}
              style={styles.action}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
  const playlist = (
    <View style={styles.playlist}>
      <AppText variant="heading" accessibilityRole="header">
        {unit.label}
      </AppText>
      <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {unit.lessons.map((item, index) => (
          <View key={item.id}>
            {index > 0 ? <Divider inset={0} /> : null}
            <LessonRow lesson={item} active={item.id === lesson.id} onPress={() => open(item)} />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <Screen edges={[]} padded={isWide} width="wide">
      <Stack.Screen options={{ title: unit.label }} />
      {isWide ? (
        <View style={styles.columns}>
          <View style={styles.main}>
            <View style={styles.rounded}>{player}</View>
            {details}
          </View>
          <View style={styles.side}>{playlist}</View>
        </View>
      ) : (
        <>
          {player}
          <View style={styles.body}>
            {details}
            {playlist}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', gap: spacing.sm },
  centre: { textAlign: 'center' },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  details: { gap: spacing.lg },
  titles: { gap: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  action: { flexGrow: 1, flexBasis: 150 },
  playlist: { gap: spacing.md },
  list: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxl },
  main: { flex: 3, minWidth: 0, gap: spacing.xl },
  side: { flex: 2, minWidth: 0, maxWidth: 420 },
  rounded: { borderRadius: radius.lg, overflow: 'hidden' },
});
