import { Tabs } from 'expo-router/js-tabs';

import { useStaffRole } from '@/features/auth';
import { Icon, type IconName } from '@/ui';

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return <Icon name={name} color={focused ? 'primary' : 'textMuted'} />;
}

export default function TabsLayout() {
  const role = useStaffRole();

  return (
    <Tabs screenOptions={{ headerTitleAlign: 'left' }}>
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
