import type { CourseSummary } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, spacing, Thumbnail } from '@/ui';

import { PriceTag } from './price-tag';

export interface CourseCardProps {
  course: CourseSummary;
  onPress: () => void;
  /** Fixed width for horizontal rows; omit to fill the column. */
  width?: number;
  showDraftBadge?: boolean;
}

export function CourseCard({ course, onPress, width, showDraftBadge }: CourseCardProps) {
  return (
    <Card
      padded={false}
      onPress={onPress}
      accessibilityLabel={course.title}
      style={width ? { width } : undefined}>
      <Thumbnail uri={course.imageUrl} fallbackIcon="school-outline" />
      <View style={styles.body}>
        <AppText variant="heading" numberOfLines={2}>
          {course.title}
        </AppText>
        {course.durationText ? (
          <AppText variant="caption" color="textMuted">
            {course.durationText}
          </AppText>
        ) : null}
        <PriceTag pricePaise={course.pricePaise} originalPricePaise={course.originalPricePaise} />
        {showDraftBadge && !course.isPublished ? (
          <Badge label="Draft — students can’t see it" tone="warning" />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, gap: spacing.xs },
});
