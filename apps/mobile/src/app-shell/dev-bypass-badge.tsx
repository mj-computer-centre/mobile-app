import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { DevBypassRole } from '@/lib/dev-bypass';

/** Always on screen while the dev bypass is active, so a demo session is never mistaken for real. */
export function DevBypassBadge({ role }: { role: DevBypassRole }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 4 }]}>
      <Text style={styles.text} accessibilityRole="text">
        DEV BYPASS · {role.toUpperCase()} · demo data, nothing saved
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#B42318',
    opacity: 0.92,
  },
  text: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
