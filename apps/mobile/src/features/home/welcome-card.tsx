import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon, radius, spacing, useLayout, useTheme } from '@/ui';

/** The greeting at the top of Home, with a way into the course list. */
export function WelcomeCard({
  firstName,
  courseCount,
  onBrowse,
}: {
  firstName: string | undefined;
  courseCount: number | undefined;
  onBrowse: () => void;
}) {
  const { colors } = useTheme();
  const { isWide } = useLayout();

  return (
    <View style={[styles.card, isWide && styles.cardWide, { backgroundColor: colors.hero }]}>
      {/* Two soft circles give the brand colour some depth without an image. */}
      <View
        pointerEvents="none"
        style={[styles.circle, styles.circleLarge, { backgroundColor: colors.onHeroSubtle }]}
      />
      <View
        pointerEvents="none"
        style={[styles.circle, styles.circleSmall, { backgroundColor: colors.onHeroSubtle }]}
      />

      <View style={styles.text}>
        <AppText variant="overline" color="onHeroMuted">
          MISHRA COMPUTER CENTRE
        </AppText>
        <AppText variant={isWide ? 'display' : 'title'} color="onHero">
          {firstName ? `Namaste, ${firstName}` : 'Namaste'}
        </AppText>
        <AppText color="onHeroMuted">
          {courseCount
            ? `${courseCount} course${courseCount === 1 ? '' : 's'} with video lessons and PDF notes, free for now.`
            : 'Video lessons and PDF notes, free for now.'}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Browse courses"
          onPress={onBrowse}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: colors.onHero, opacity: pressed ? 0.85 : 1 },
          ]}>
          <AppText variant="label" color="hero">
            Browse courses
          </AppText>
          <Icon name="arrow-right" size={18} color="hero" />
        </Pressable>
      </View>

      {isWide ? (
        <View style={[styles.art, { backgroundColor: colors.onHeroSubtle }]}>
          <Icon name="laptop" size={72} color="onHero" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  cardWide: { padding: spacing.xxl + spacing.sm },
  text: { flex: 1, gap: spacing.sm, alignItems: 'flex-start' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    borderRadius: radius.pill,
  },
  art: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  circle: { position: 'absolute', borderRadius: 999 },
  circleLarge: { width: 280, height: 280, right: -90, top: -120 },
  circleSmall: { width: 160, height: 160, right: 140, bottom: -110 },
});
