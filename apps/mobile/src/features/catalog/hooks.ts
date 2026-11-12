import { useQuery } from '@tanstack/react-query';

import { fetchActiveBanners, fetchCourseDetail, fetchCourseOptions, fetchCourses } from './api';

/** Query keys for catalog data. Admin changes invalidate `catalogKeys.all`. */
export const catalogKeys = {
  all: ['catalog'] as const,
  courses: (includeDrafts: boolean) => ['catalog', 'courses', { includeDrafts }] as const,
  course: (courseId: string) => ['catalog', 'course', courseId] as const,
  banners: ['catalog', 'banners'] as const,
  courseOptions: ['catalog', 'course-options'] as const,
};

export function useCourses(options: { includeDrafts?: boolean } = {}) {
  const includeDrafts = options.includeDrafts ?? false;
  return useQuery({
    queryKey: catalogKeys.courses(includeDrafts),
    queryFn: () => fetchCourses({ includeDrafts }),
  });
}

export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: catalogKeys.course(courseId),
    queryFn: () => fetchCourseDetail(courseId),
  });
}

export function useBanners() {
  return useQuery({ queryKey: catalogKeys.banners, queryFn: fetchActiveBanners });
}

export function useCourseOptions() {
  return useQuery({ queryKey: catalogKeys.courseOptions, queryFn: fetchCourseOptions });
}
