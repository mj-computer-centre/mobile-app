import { discountPercent, formatInr } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, spacing } from '@/ui';

/** "₹0  ₹14,999  100% OFF": the price now, the original crossed out, and the saving. */
export function PriceTag({
  pricePaise,
  originalPricePaise,
  large = false,
}: {
  pricePaise: number;
  originalPricePaise: number | null;
  /** Bigger figures, for the course page. */
  large?: boolean;
}) {
  const discount = discountPercent(originalPricePaise, pricePaise);
  const label =
    discount !== null && originalPricePaise !== null
      ? `${formatInr(pricePaise)}, was ${formatInr(originalPricePaise)}, ${discount}% off`
      : formatInr(pricePaise);

  return (
    <View style={styles.row} accessible accessibilityLabel={label}>
      <AppText variant={large ? 'title' : 'subheading'}>{formatInr(pricePaise)}</AppText>
      {discount !== null && originalPricePaise !== null ? (
        <>
          <AppText variant={large ? 'body' : 'caption'} color="textMuted" style={styles.strike}>
            {formatInr(originalPricePaise)}
          </AppText>
          <Badge label={`${discount}% OFF`} tone="success" />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  strike: { textDecorationLine: 'line-through' },
});
