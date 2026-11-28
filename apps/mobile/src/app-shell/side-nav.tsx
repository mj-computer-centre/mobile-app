import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View, type PressableStateCallbackType } from 'react-native';

import { useStaffRole } from '@/features/auth';
import { useMyProfile } from '@/features/profile';
import { AppText, Avatar, BrandLockup, radius, spacing, useTheme } from '@/ui';

import { navItems, type NavItem } from './nav-items';

const SIDEBAR_WIDTH = 264;

/**
 * The tab bar on wide screens (the website on a laptop, Android tablets): a left sidebar with
 * the centre's name, the same tabs as the phone's bottom bar, and who is signed in. Phones
 * keep the standard bottom tab bar.
 */
export function SideNav(props: BottomTabBarProps) {
  const { colors } = useTheme();
  const role = useStaffRole();
  const profile = useMyProfile();
  const name = profile.data?.full_name || profile.data?.email || 'Signed in';

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.sidebar,
          borderRightColor: colors.border,
          paddingTop: props.insets.top + spacing.xl,
          paddingBottom: props.insets.bottom + spacing.lg,
        },
      ]}>
      <View style={styles.brand}>
        <BrandLockup />
      </View>

      <View style={styles.items} accessibilityRole="tablist">
        {navItems(props).map((item) => (
          <SideNavItem key={item.key} item={item} />
        ))}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Avatar name={name} size={38} />
        <View style={styles.grow}>
          <AppText variant="bodyStrong" numberOfLines={1}>
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

type ItemState = PressableStateCallbackType & { hovered?: boolean };

function SideNavItem({ item }: { item: NavItem }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: item.focused }}
      onPress={item.onPress}
      style={(state: ItemState) => [
        styles.item,
        {
          backgroundColor: item.focused
            ? colors.sidebarActive
            : state.hovered || state.pressed
              ? colors.surfaceMuted
              : 'transparent',
        },
      ]}>
      {item.renderIcon()}
      <AppText variant="label" color={item.focused ? 'primary' : 'text'}>
        {item.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    gap: spacing.xl,
  },
  brand: { paddingHorizontal: spacing.sm },
  grow: { flex: 1, minWidth: 0 },
  items: { flex: 1, gap: spacing.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 46,
    paddingLeft: spacing.xs,
    paddingRight: spacing.md,
    borderRadius: radius.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
