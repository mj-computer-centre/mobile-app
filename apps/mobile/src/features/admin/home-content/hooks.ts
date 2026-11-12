import type { SettingsFormValues } from '@mcc/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { settingsKeys } from '@/features/contact';
import type { PickedFile } from '@/lib/platform/picked-file';

import { adminKeys, useRefreshContent } from '../shared/keys';
import {
  addBanner,
  deleteBanner,
  fetchAllBanners,
  saveBannerOrder,
  saveSettings,
  updateBanner,
} from './api';

export function useAllBanners() {
  return useQuery({ queryKey: adminKeys.banners, queryFn: fetchAllBanners });
}

export function useBannerActions() {
  const refresh = useRefreshContent();
  return {
    add: useMutation({
      mutationFn: ({ file, position }: { file: PickedFile; position: number }) =>
        addBanner(file, position),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        ...changes
      }: {
        id: string;
        isActive?: boolean;
        courseId?: string | null;
      }) => updateBanner(id, changes),
      onSuccess: refresh,
    }),
    reorder: useMutation({ mutationFn: saveBannerOrder, onSuccess: refresh }),
    remove: useMutation({ mutationFn: deleteBanner, onSuccess: refresh }),
  };
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: SettingsFormValues) => saveSettings(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.all }),
  });
}
