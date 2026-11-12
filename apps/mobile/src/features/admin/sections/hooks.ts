import type { SectionFormValues } from '@mcc/shared';
import { useMutation, useQuery } from '@tanstack/react-query';

import { adminKeys, useRefreshContent } from '../shared/keys';
import {
  attachLessons,
  deleteSection,
  detachLesson,
  fetchLibrarySections,
  fetchSectionDetail,
  reorderLessons,
  setVideoNotes,
  updateSection,
} from './api';

export function useSectionDetail(sectionId: string) {
  return useQuery({
    queryKey: adminKeys.section(sectionId),
    queryFn: () => fetchSectionDetail(sectionId),
  });
}

export function useLibrarySections() {
  return useQuery({ queryKey: adminKeys.sections, queryFn: fetchLibrarySections });
}

export function useUpdateSection(sectionId: string) {
  const refresh = useRefreshContent();
  return useMutation({
    mutationFn: (values: SectionFormValues) => updateSection(sectionId, values),
    onSuccess: refresh,
  });
}

export function useDeleteSection() {
  const refresh = useRefreshContent();
  return useMutation({ mutationFn: deleteSection, onSuccess: refresh });
}

/** Lesson membership of one unit, plus topic-wise notes on its videos. */
export function useSectionLessons(sectionId: string) {
  const refresh = useRefreshContent();
  return {
    attach: useMutation({
      mutationFn: (lessonIds: string[]) => attachLessons(sectionId, lessonIds),
      onSuccess: refresh,
    }),
    detach: useMutation({
      mutationFn: (lessonId: string) => detachLesson(sectionId, lessonId),
      onSuccess: refresh,
    }),
    reorder: useMutation({
      mutationFn: (lessonIds: string[]) => reorderLessons(sectionId, lessonIds),
      onSuccess: refresh,
    }),
    setNotes: useMutation({
      mutationFn: ({ videoId, notesId }: { videoId: string; notesId: string | null }) =>
        setVideoNotes(videoId, notesId),
      onSuccess: refresh,
    }),
  };
}
