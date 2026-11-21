import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useStaffRole } from '@/features/auth';
import { useMyProfile } from '@/features/profile';
import { AppText, Icon, radius, spacing, useTheme } from '@/ui';

const SIDEBAR_WIDTH = 256;

/**
 * The tab bar on wide screens (the web admin on a laptop, Android tablets): a left sidebar with
 * the centre's name, the same tabs as the phone's bottom bar, and who is signed in. Phones keep
 * the standard bottom tab bar.
 */
export function SideNav({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { colors } = useTheme();
  const role = useStaffRole();
  const profile = useMyProfile();
  const focusedKey = state.routes[state.index]?.key;
  const name = profile.data?.full_name || profile.data?.email || 'Signed in';

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.sidebar,
          borderRightColor: colors.border,
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}>
      <View style={styles.brand}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <Icon name="laptop" size={22} color="onPrimary" />
        </View>
        <View style={styles.grow}>
          <AppText variant="label" numberOfLines={2}>
            Mishra Computer Centre
          </AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            Makhdumpur, Jehanabad
          </AppText>
        </View>
      </View>

      <View style={styles.items} accessibilityRole="tablist">
        {state.routes.map((route) => {
          const descriptor = descriptors[route.key];
          if (!descriptor || descriptor.options.hidden) return null;
          const { options } = descriptor;
          const focused = route.key === focusedKey;
          return (
            <SideNavItem
              key={route.key}
              label={options.title ?? route.name}
              focused={focused}
              icon={options.tabBarIcon?.({
                focused,
                color: focused ? colors.primary : colors.textMuted,
                size: 22,
              })}
              onPress={() => {
                const event = emitter.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) navigateToTab(route.key);
              }}
            />
          );
        })}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
          <AppText variant="label" color="primary">
            {initials(name)}
          </AppText>
        </View>
        <View style={styles.grow}>
          <AppText variant="label" numberOfLines={1}>
            {name}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {role === 'owner' ? 'Owner' : role === 'admin' ? 'Admin' : 'Student'}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function SideNavItem({
  label,
  icon,
  focused,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  focused: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: focused
            ? colors.sidebarActive
            : hovered || pressed
              ? colors.surfaceMuted
              : 'transparent',
        },
      ]}>
      {focused ? <View style={[styles.marker, { backgroundColor: colors.primary }]} /> : null}
      {icon}
      <AppText variant="label" color={focused ? 'primary' : 'text'}>
        {label}
      </AppText>
    </Pressable>
  );
}

function initials(name: string): string {
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

const styles = StyleSheet.create({
  root: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    gap: spacing.xl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1, minWidth: 0 },
  items: { flex: 1, gap: spacing.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  marker: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: radius.pill,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
