import { StyleSheet, Text, View } from 'react-native';

import { fonts, useTheme } from '../theme';

/** "Asha Kumari" → "AK"; "asha@gmail.com" → "AG". */
export function initialsOf(name: string): string {
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

/** A person, shown as their initials on a soft circle. */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primarySoft },
      ]}>
      <Text style={[styles.initials, { color: colors.primary, fontSize: Math.round(size * 0.38) }]}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fonts.heading, includeFontPadding: false },
});
