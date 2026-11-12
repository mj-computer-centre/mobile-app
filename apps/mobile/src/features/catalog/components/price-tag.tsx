import { discountPercent, formatInr } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, spacing } from '@/ui';

/** "₹0  ₹14,999  100% OFF" — the free-now price with the original crossed out. */
export function PriceTag({
  pricePaise,
  originalPricePaise,
}: {
  pricePaise: number;
  originalPricePaise: number | null;
}) {
  const discount = discountPercent(originalPricePaise, pricePaise);
  const label =
    discount !== null && originalPricePaise !== null
      ? `${formatInr(pricePaise)}, was ${formatInr(originalPricePaise)}, ${discount}% off`
      : formatInr(pricePaise);

  return (
    <View style={styles.row} accessible accessibilityLabel={label}>
      <AppText variant="label">{formatInr(pricePaise)}</AppText>
      {discount !== null && originalPricePaise !== null ? (
        <>
          <AppText variant="caption" color="textMuted" style={styles.strike}>
            {formatInr(originalPricePaise)}
          </AppText>
          <AppText variant="caption" color="success" style={styles.bold}>
            {discount}% OFF
          </AppText>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, flexWrap: 'wrap' },
  strike: { textDecorationLine: 'line-through' },
  bold: { fontWeight: '700' },
});
