import { Tabs } from 'expo-router/js-tabs';

import { SideNav } from '@/app-shell/side-nav';
import { useStaffRole } from '@/features/auth';
import { Icon, useLayout, type IconName } from '@/ui';

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return <Icon name={name} color={focused ? 'primary' : 'textMuted'} />;
}

export default function TabsLayout() {
  const role = useStaffRole();
  // Wide screens get a left sidebar instead of the phone's bottom bar. Each page already starts
  // with its own big title, so the small header above it is dropped there too.
  const { isWide } = useLayout();

  return (
    <Tabs
      tabBar={isWide ? (props) => <SideNav {...props} /> : undefined}
      screenOptions={{
        headerTitleAlign: 'left',
        tabBarPosition: isWide ? 'left' : 'bottom',
        headerShown: !isWide,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="book-open-page-variant-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contact',
          tabBarIcon: ({ focused }) => <TabIcon name="phone-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="account-circle-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ focused }) => <TabIcon name="shield-account-outline" focused={focused} />,
          // Students never see the tab; the screens behind it are guarded separately.
          href: role ? undefined : null,
        }}
      />
    </Tabs>
  );
}
