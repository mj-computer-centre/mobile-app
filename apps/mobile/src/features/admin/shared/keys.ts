import { useQueryClient } from '@tanstack/react-query';

import { catalogKeys } from '@/features/catalog';

/** Query keys for admin-only data. */
export const adminKeys = {
  all: ['admin'] as const,
  dashboard: ['admin', 'dashboard'] as const,
  course: (courseId: string) => ['admin', 'course', courseId] as const,
  section: (sectionId: string) => ['admin', 'section', sectionId] as const,
  sections: ['admin', 'sections'] as const,
  lessons: ['admin', 'lessons'] as const,
  tests: ['admin', 'tests'] as const,
  test: (testId: string) => ['admin', 'test', testId] as const,
  testQuestions: (testId: string) => ['admin', 'test-questions', testId] as const,
  testResults: (testId: string) => ['admin', 'test-results', testId] as const,
  students: ['admin', 'students'] as const,
  banners: ['admin', 'banners'] as const,
  staff: ['admin', 'staff'] as const,
};

/**
 * After any content change, refresh both what admins see and what students see, so an edit shows
 * up in the student screens of the same device straight away.
 */
export function useRefreshContent(): () => Promise<void> {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminKeys.all }),
      queryClient.invalidateQueries({ queryKey: catalogKeys.all }),
    ]);
  };
}
