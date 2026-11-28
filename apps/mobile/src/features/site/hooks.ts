import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';

import { useAccess } from '@/features/auth';

import { fetchCourseOutline, fetchPublicCourse, fetchSiteStats, fetchUpcomingTests } from './api';

/** Query keys for what the public website shows. */
export const siteKeys = {
  all: ['site'] as const,
  stats: ['site', 'stats'] as const,
  upcomingTests: ['site', 'upcoming-tests'] as const,
  outline: (courseId: string) => ['site', 'outline', courseId] as const,
  course: (courseId: string) => ['site', 'course', courseId] as const,
};

/**
 * True for a visitor on the website who has not signed in: the pages then wear the public
 * website's top bar and footer instead of the app's navigation.
 */
export function useIsPublicSite(): boolean {
  return useAccess().status === 'signed-out' && Platform.OS === 'web';
}

export function useSiteStats() {
  return useQuery({ queryKey: siteKeys.stats, queryFn: fetchSiteStats, staleTime: 5 * 60_000 });
}

export function useUpcomingTests() {
  return useQuery({ queryKey: siteKeys.upcomingTests, queryFn: fetchUpcomingTests });
}

export function useCourseOutline(courseId: string) {
  return useQuery({
    queryKey: siteKeys.outline(courseId),
    queryFn: () => fetchCourseOutline(courseId),
  });
}

export function usePublicCourse(courseId: string) {
  return useQuery({
    queryKey: siteKeys.course(courseId),
    queryFn: () => fetchPublicCourse(courseId),
  });
}
