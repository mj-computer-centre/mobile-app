import { Tabs } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHeaderOptions } from '@/app-shell/header-options';
import { TabIcon } from '@/app-shell/nav-items';
import { PublicNav } from '@/app-shell/public-nav';
import { SideNav } from '@/app-shell/side-nav';
import { useIsSignedIn, useStaffRole } from '@/features/auth';
import { BrandLockup, fonts, useLayout, useTheme } from '@/ui';

/**
 * The main places of the app, in three shapes from one list of tabs:
 * - a visitor on the website (not signed in): a bar across the top with the public pages;
 * - signed in on a wide screen: a sidebar;
 * - signed in on a phone: the bottom tab bar.
 */
export default function TabsLayout() {
  const signedIn = useIsSignedIn();
  const role = useStaffRole();
  const { isWide } = useLayout();
  const { colors } = useTheme();
  const header = useHeaderOptions();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={
        !signedIn
          ? (props) => <PublicNav {...props} />
          : isWide
            ? (props) => <SideNav {...props} />
            : undefined
      }
      screenOptions={{
        ...header,
        headerTitleAlign: 'left',
        // Wide screens and the public website start each page with its own title.
        headerShown: signedIn && !isWide,
        tabBarPosition: !signedIn ? 'top' : isWide ? 'left' : 'bottom',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.label, fontSize: 12, lineHeight: 16 },
        // Taller than the default bar: the chosen tab's icon sits on a pill above its label.
        tabBarStyle: {
          height: 66 + insets.bottom,
          paddingTop: 6,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: () => <BrandLockup size={32} showPlace={false} />,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home-variant' : 'home-variant-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'book-open-page-variant' : 'book-open-page-variant-outline'}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: 'Tests',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'clipboard-text-clock' : 'clipboard-text-clock-outline'}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contact',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'phone' : 'phone-outline'} focused={focused} />
          ),
          // A phone's bar holds five tabs. Staff get Admin there; they reach Contact from Profile.
          href: role && !isWide ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'account-circle' : 'account-circle-outline'}
              focused={focused}
            />
          ),
          href: signedIn ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'shield-account' : 'shield-account-outline'}
              focused={focused}
            />
          ),
          // Students never see the tab; the screens behind it are guarded separately.
          href: role ? undefined : null,
        }}
      />
    </Tabs>
  );
}
