import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { SiteTopBar, type SitePageName } from '@/features/site';

import { navItems } from './nav-items';

/** The website's pages, by the name of the tab that shows each. */
const TAB_PAGES: Record<string, SitePageName> = {
  index: 'home',
  courses: 'courses',
  tests: 'tests',
  contact: 'contact',
};

/**
 * The tab bar for visitors who have not signed in: the public website's top bar, driven by the
 * tab navigator so moving between Home, Courses, Tests and Contact keeps each page's place.
 */
export function PublicNav(props: BottomTabBarProps) {
  const items = navItems(props);
  const focused = items.find((item) => item.focused);
  return (
    <SiteTopBar
      current={focused ? (TAB_PAGES[focused.name] ?? null) : null}
      topInset={props.insets.top}
      onNavigate={(page) => items.find((item) => TAB_PAGES[item.name] === page)?.onPress()}
    />
  );
}
