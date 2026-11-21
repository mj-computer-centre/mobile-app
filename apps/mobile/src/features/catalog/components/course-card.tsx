import type { CourseSummary } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, Icon, spacing } from '@/ui';

import { CourseCover } from './course-cover';
import { PriceTag } from './price-tag';

export interface CourseCardProps {
  course: CourseSummary;
  onPress: () => void;
  /** Fixed width for horizontal rows; omit to fill the column. */
  width?: number;
  /** Grow to the height of its grid row, so cards side by side line up. */
  stretch?: boolean;
  showDraftBadge?: boolean;
}

export function CourseCard({ course, onPress, width, stretch, showDraftBadge }: CourseCardProps) {
  return (
    <Card
      padded={false}
      onPress={onPress}
      accessibilityLabel={course.title}
      style={width ? { width } : stretch ? styles.stretch : undefined}>
      <CourseCover title={course.title} imageUrl={course.imageUrl} />
      <View style={styles.body}>
        <AppText variant="heading" numberOfLines={1}>
          {course.title}
        </AppText>
        {course.shortDescription ? (
          <AppText variant="caption" color="textMuted" numberOfLines={2}>
            {course.shortDescription}
          </AppText>
        ) : null}
        <View style={styles.footer}>
          <PriceTag pricePaise={course.pricePaise} originalPricePaise={course.originalPricePaise} />
          {course.durationText ? (
            <View style={styles.duration}>
              <Icon name="clock-outline" size={14} color="textMuted" />
              <AppText variant="caption" color="textMuted">
                {course.durationText}
              </AppText>
            </View>
          ) : null}
        </View>
        {showDraftBadge && !course.isPublished ? (
          <Badge label="Draft — students can’t see it" tone="warning" />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stretch: { flexGrow: 1 },
  body: { padding: spacing.lg, gap: spacing.xs, flexGrow: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 'auto',
    paddingTop: spacing.sm,
  },
  duration: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
