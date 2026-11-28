import type { CourseFormValues, SectionFormValues } from '@mcc/shared';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { PickedFile } from '@/lib/platform/picked-file';

import { adminKeys, useRefreshContent } from '../shared/keys';
import {
  attachSection,
  clearCourseImage,
  createCourseWithCover,
  createSectionInCourse,
  deleteCourse,
  detachSection,
  fetchCourseRecord,
  reorderSections,
  replaceCourseImage,
  saveCourseOrder,
  updateCourse,
  type CourseRecord,
} from './api';

export function useCourseRecord(courseId: string) {
  return useQuery({
    queryKey: adminKeys.course(courseId),
    queryFn: () => fetchCourseRecord(courseId),
  });
}

/** Creates a course, with the cover picture chosen on the same page when there is one. */
export function useCreateCourse() {
  const refresh = useRefreshContent();
  return useMutation({
    mutationFn: ({ values, cover }: { values: CourseFormValues; cover: PickedFile | null }) =>
      createCourseWithCover(values, cover),
    onSuccess: refresh,
  });
}

export function useUpdateCourse(courseId: string) {
  const refresh = useRefreshContent();
  return useMutation({
    mutationFn: (values: CourseFormValues) => updateCourse(courseId, values),
    onSuccess: refresh,
  });
}

export function useDeleteCourse() {
  const refresh = useRefreshContent();
  return useMutation({ mutationFn: deleteCourse, onSuccess: refresh });
}

export function useReplaceCourseImage(
  course: Pick<CourseRecord, 'id' | 'thumbnail_path'> | undefined,
) {
  const refresh = useRefreshContent();
  return useMutation({
    mutationFn: async (file: PickedFile) => {
      if (course) await replaceCourseImage(course, file);
    },
    onSuccess: refresh,
  });
}

export function useClearCourseImage(
  course: Pick<CourseRecord, 'id' | 'thumbnail_path'> | undefined,
) {
  const refresh = useRefreshContent();
  return useMutation({
    mutationFn: async () => {
      if (course) await clearCourseImage(course);
    },
    onSuccess: refresh,
  });
}

export function useSaveCourseOrder() {
  const refresh = useRefreshContent();
  return useMutation({ mutationFn: saveCourseOrder, onSuccess: refresh });
}

/** Unit membership of one course: add new, add existing, remove, reorder. */
export function useCourseUnits(courseId: string) {
  const refresh = useRefreshContent();
  return {
    createUnit: useMutation({
      mutationFn: (values: SectionFormValues) => createSectionInCourse(courseId, values),
      onSuccess: refresh,
    }),
    attachUnit: useMutation({
      mutationFn: (sectionId: string) => attachSection(courseId, sectionId),
      onSuccess: refresh,
    }),
    detachUnit: useMutation({
      mutationFn: (sectionId: string) => detachSection(courseId, sectionId),
      onSuccess: refresh,
    }),
    reorderUnits: useMutation({
      mutationFn: (sectionIds: string[]) => reorderSections(courseId, sectionIds),
      onSuccess: refresh,
    }),
  };
}
