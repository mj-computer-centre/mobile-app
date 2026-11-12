import type { Lesson, Unit } from '@mcc/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, Icon, spacing, useTheme } from '@/ui';

import { LessonRow } from './lesson-row';

export interface UnitListProps {
  units: Unit[];
  onOpenLesson: (lesson: Lesson, unit: Unit) => void;
  /** Units start collapsed except the first, so long courses stay scannable. */
  initiallyOpen?: number;
}

export function UnitList({ units, onOpenLesson, initiallyOpen = 0 }: UnitListProps) {
  return (
    <View style={styles.list}>
      {units.map((unit, index) => (
        <UnitCard
          key={unit.sectionId}
          unit={unit}
          open={index === initiallyOpen}
          onOpenLesson={onOpenLesson}
        />
      ))}
    </View>
  );
}

function UnitCard({
  unit,
  open,
  onOpenLesson,
}: {
  unit: Unit;
  open: boolean;
  onOpenLesson: UnitListProps['onOpenLesson'];
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(open);
  const videos = unit.lessons.filter((lesson) => lesson.kind === 'video').length;
  const pdfs = unit.lessons.length - videos;

  return (
    <Card padded={false}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={unit.label}
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="label">{unit.label}</AppText>
          <AppText variant="caption" color="textMuted">
            {[
              videos ? `${videos} video${videos === 1 ? '' : 's'}` : null,
              pdfs ? `${pdfs} PDF${pdfs === 1 ? '' : 's'}` : null,
            ]
              .filter(Boolean)
              .join(' · ') || 'Lessons coming soon'}
          </AppText>
        </View>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} color="textMuted" />
      </Pressable>
      {expanded ? (
        <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
          {unit.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} onPress={() => onOpenLesson(lesson, unit)} />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  headerText: { flex: 1, gap: 2 },
});
