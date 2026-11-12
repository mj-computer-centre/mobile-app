import { useMutation, useQuery } from '@tanstack/react-query';

import type { PickedFile } from '@/lib/platform/picked-file';

import { adminKeys, useRefreshContent } from '../shared/keys';
import {
  createPdfLesson,
  deleteLesson,
  fetchLibraryLessons,
  fetchYoutubeMeta,
  renameLesson,
  saveVideoLessons,
} from './api';

export function useLibraryLessons() {
  return useQuery({ queryKey: adminKeys.lessons, queryFn: fetchLibraryLessons });
}

/** Looks a link up on YouTube. A mutation, because it runs when the admin taps "Find". */
export function useYoutubeLookup() {
  return useMutation({ mutationFn: fetchYoutubeMeta });
}

export function useSaveVideoLessons() {
  const refresh = useRefreshContent();
  return useMutation({ mutationFn: saveVideoLessons, onSuccess: refresh });
}

export function useCreatePdfLesson() {
  const refresh = useRefreshContent();
  return useMutation({
    mutationFn: ({ file, title }: { file: PickedFile; title: string }) =>
      createPdfLesson(file, title),
    onSuccess: refresh,
  });
}

export function useRenameLesson() {
  const refresh = useRefreshContent();
  return useMutation({
    mutationFn: ({ lessonId, title }: { lessonId: string; title: string }) =>
      renameLesson(lessonId, title),
    onSuccess: refresh,
  });
}

export function useDeleteLesson() {
  const refresh = useRefreshContent();
  return useMutation({ mutationFn: deleteLesson, onSuccess: refresh });
}
