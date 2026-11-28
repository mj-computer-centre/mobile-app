import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, useTheme } from '../theme';

/** A hairline between rows, inset so it starts under the text rather than the icon. */
export function Divider({ inset = spacing.lg }: { inset?: number }) {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: inset }]} />;
}

/**
 * Rows that belong together, on one surface with hairlines between them. This is how lists are
 * grouped: one surface for the group, not a card per row.
 */
export function ListGroup({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const rows = Children.toArray(children);
  if (rows.length === 0) return null;
  return (
    <View
      style={[
        styles.group,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}>
      {rows.map((row, index) => (
        // Rows never reorder inside a group without the group re-rendering, so place is a safe key.
        <Fragment key={index}>
          {index > 0 ? <Divider /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  divider: { height: StyleSheet.hairlineWidth },
});
