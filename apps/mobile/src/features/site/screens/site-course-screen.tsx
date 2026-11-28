import { formatDuration, type CourseOutline, type OutlineUnit } from '@mcc/shared';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CourseCover, lessonCounts, PriceTag } from '@/features/catalog';
import { PageTitle } from '@/lib/page-title';
import { routes } from '@/lib/routes';
import {
  AppText,
  Button,
  Divider,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Notice,
  radius,
  SectionHeader,
  SkeletonRows,
  spacing,
  useLayout,
  useTheme,
  type IconName,
} from '@/ui';

import { Section, SitePage } from '../components/site-page';
import { useCourseOutline, usePublicCourse } from '../hooks';

/**
 * A course on the public website: what it is and what it covers, unit by unit. The lessons
 * themselves open after signing in.
 */
export function SiteCourseScreen({ courseId }: { courseId: string }) {
  const course = usePublicCourse(courseId);
  const outline = useCourseOutline(courseId);
  const { isWide } = useLayout();
  const signIn = () => router.push(routes.signIn);

  if (course.isPending) {
    return (
      <SitePage current="courses">
        <LoadingState />
      </SitePage>
    );
  }
  if (course.isError) {
    return (
      <SitePage current="courses">
        <ErrorState error={course.error} onRetry={() => void course.refetch()} />
      </SitePage>
    );
  }
  if (!course.data) {
    return (
      <SitePage current="courses">
        <EmptyState
          icon="book-off-outline"
          title="This course is not available"
          message="It may have been removed, or the link may be wrong."
          action={{ label: 'See all courses', onPress: () => router.replace(routes.courses) }}
        />
      </SitePage>
    );
  }

  const detail = course.data;
  const heading = (
    <View style={styles.heading}>
      <Button
        label="All courses"
        variant="ghost"
        compact
        icon="arrow-left"
        onPress={() => router.navigate(routes.courses)}
        style={styles.back}
      />
      <AppText variant="display" accessibilityRole="header">
        {detail.title}
      </AppText>
      {detail.shortDescription ? (
        <AppText color="textMuted">{detail.shortDescription}</AppText>
      ) : null}
      {outline.data ? <Facts outline={outline.data} duration={detail.durationText} /> : null}
    </View>
  );
  const start = (
    <View style={styles.start}>
      <PriceTag
        large
        pricePaise={detail.pricePaise}
        originalPricePaise={detail.originalPricePaise}
      />
      <Button
        label="Sign in to start learning"
        variant="accent"
        iconAfter="arrow-right"
        onPress={signIn}
      />
    </View>
  );
  const about =
    detail.aboutPoints.length > 0 ? (
      <View style={styles.block}>
        <AppText variant="heading" accessibilityRole="header">
          About this course
        </AppText>
        <View style={styles.points}>
          {detail.aboutPoints.map((point) => (
            <View key={point} style={styles.point}>
              <Icon name="check-circle" size={19} color="success" />
              <AppText style={styles.grow}>{point}</AppText>
            </View>
          ))}
        </View>
      </View>
    ) : null;
  const units = (
    <View style={styles.block}>
      <SectionHeader title="What it covers" />
      {outline.isPending ? (
        <SkeletonRows />
      ) : outline.isError ? (
        <ErrorState error={outline.error} onRetry={() => void outline.refetch()} />
      ) : outline.data.units.length === 0 ? (
        <AppText color="textMuted">The centre has not added lessons to this course yet.</AppText>
      ) : (
        <>
          <Notice icon="lock-outline" tone="primary">
            Sign in to play the videos and open the notes.
          </Notice>
          {outline.data.units.map((unit) => (
            <UnitOutline key={unit.position} unit={unit} />
          ))}
        </>
      )}
    </View>
  );

  return (
    <SitePage current="courses">
      <PageTitle
        title={detail.title}
        {...(detail.shortDescription ? { description: detail.shortDescription } : {})}
      />
      <Section>
        {isWide ? (
          <View style={styles.columns}>
            <View style={styles.main}>
              {heading}
              {units}
            </View>
            <View style={styles.side}>
              <CourseCover title={detail.title} imageUrl={detail.imageUrl} rounded />
              {start}
              {about}
            </View>
          </View>
        ) : (
          <>
            <CourseCover title={detail.title} imageUrl={detail.imageUrl} rounded />
            {heading}
            {start}
            {about}
            {units}
          </>
        )}
      </Section>
    </SitePage>
  );
}

function Facts({ outline, duration }: { outline: CourseOutline; duration: string }) {
  const facts: { icon: IconName; text: string }[] = [
    {
      icon: 'view-list-outline',
      text: `${outline.units.length} unit${outline.units.length === 1 ? '' : 's'}`,
    },
  ];
  if (outline.videoCount)
    facts.push({
      icon: 'play-circle-outline',
      text: `${outline.videoCount} video${outline.videoCount === 1 ? '' : 's'}`,
    });
  if (outline.pdfCount)
    facts.push({ icon: 'file-document-outline', text: `${outline.pdfCount} PDF notes` });
  if (outline.totalVideoSeconds > 0)
    facts.push({
      icon: 'clock-outline',
      text: `${formatDuration(outline.totalVideoSeconds)} of video`,
    });
  if (duration) facts.push({ icon: 'calendar-month-outline', text: `${duration} course` });

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

/** A unit and the titles of its lessons. Nothing here plays: it is a table of contents. */
function UnitOutline({ unit }: { unit: OutlineUnit }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.unit, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.unitHeader}>
        <AppText variant="subheading">{unit.label}</AppText>
        <AppText variant="caption" color="textMuted">
          {lessonCounts(unit.lessons)}
        </AppText>
      </View>
      {unit.lessons.map((lesson, index) => (
        <View key={`${lesson.title}-${index}`}>
          <Divider inset={0} />
          <View style={styles.lesson}>
            <Icon
              name={lesson.kind === 'video' ? 'play-circle-outline' : 'file-document-outline'}
              size={20}
              color="textMuted"
            />
            <AppText style={styles.grow} numberOfLines={2}>
              {lesson.title}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {lesson.kind === 'pdf'
                ? 'PDF'
                : lesson.durationSeconds
                  ? formatDuration(lesson.durationSeconds)
                  : 'Video'}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.sm },
  back: { alignSelf: 'flex-start', marginLeft: -spacing.sm },
  facts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.xs },
  fact: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  start: { gap: spacing.md },
  block: { gap: spacing.md },
  points: { gap: spacing.sm },
  point: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  grow: { flex: 1 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxxl },
  main: { flex: 3, minWidth: 0, gap: spacing.xxl },
  side: { flex: 2, minWidth: 0, maxWidth: 400, gap: spacing.xl },
  unit: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  unitHeader: { padding: spacing.lg, gap: 2 },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
