import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';

import { Icon, radius, useTheme, type IconName } from '@/ui';

/** A tab's icon. The chosen tab sits on a soft pill, as Android's own bottom bars do. */
export function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.pill, focused && { backgroundColor: colors.primarySoft }]}>
      <Icon name={name} size={22} color={focused ? 'primary' : 'textMuted'} />
    </View>
  );
}

export interface NavItem {
  key: string;
  name: string;
  label: string;
  focused: boolean;
  /** The icon the tab declared, for navigation that shows icons. */
  renderIcon: () => React.ReactNode;
  onPress: () => void;
}

/**
 * The visible tabs of a tab navigator, as plain items. The sidebar and the public website's
 * top bar are both drawn from this, so they always offer the same places as the phone's bar.
 */
export function navItems({
  state,
  descriptors,
  emitter,
  navigateToTab,
}: Pick<BottomTabBarProps, 'state' | 'descriptors' | 'emitter' | 'navigateToTab'>): NavItem[] {
  const focusedKey = state.routes[state.index]?.key;
  return state.routes.flatMap((route) => {
    const descriptor = descriptors[route.key];
    if (!descriptor || descriptor.options.hidden) return [];
    const { options } = descriptor;
    const focused = route.key === focusedKey;
    return [
      {
        key: route.key,
        name: route.name,
        label: options.title ?? route.name,
        focused,
        renderIcon: () => options.tabBarIcon?.({ focused, color: '', size: 22 }),
        onPress: () => {
          const event = emitter.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        },
      },
    ];
  });
}

const styles = StyleSheet.create({
  pill: {
    width: 56,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
