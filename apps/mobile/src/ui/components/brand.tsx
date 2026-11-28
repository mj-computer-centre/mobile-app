import { StyleSheet, View } from 'react-native';

import { spacing } from '../theme';
import { AppText } from './app-text';
import { KeyCap } from './key-cap';

export const CENTRE_NAME = 'Mishra Computer Centre';
export const CENTRE_PLACE = 'Makhdumpur, Jehanabad';

/** The centre's mark: the M key, in the Enter key's colour. */
export function BrandMark({ size = 40 }: { size?: number }) {
  return <KeyCap legend="M" size={size} tone="accent" accessibilityLabel={CENTRE_NAME} />;
}

/** The mark with the centre's name beside it. `onHero` for use on the dark brand colour. */
export function BrandLockup({
  size = 40,
  onHero = false,
  showPlace = true,
}: {
  size?: number;
  onHero?: boolean;
  showPlace?: boolean;
}) {
  return (
    <View style={styles.row} accessible accessibilityLabel={CENTRE_NAME}>
      <BrandMark size={size} />
      <View style={styles.text}>
        <AppText variant="subheading" color={onHero ? 'onHero' : 'text'} numberOfLines={1}>
          {CENTRE_NAME}
        </AppText>
        {showPlace ? (
          <AppText variant="caption" color={onHero ? 'onHeroMuted' : 'textMuted'} numberOfLines={1}>
            {CENTRE_PLACE}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flexShrink: 1, minWidth: 0 },
});
