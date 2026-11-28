import { IMAGE_WIDTHS, settingsFormToRow, type SettingsFormValues } from '@mcc/shared';

import { run, runVoid } from '@/lib/data';
import { fileUrls } from '@/lib/file-urls';
import type { PickedFile } from '@/lib/platform/picked-file';
import { supabase } from '@/lib/supabase';

import { removeImages, storeImage } from '../shared/uploads';

export interface AdminBanner {
  id: string;
  /** What the row holds: a Cloudinary URL, or a media-bucket path for an older banner. */
  imagePath: string;
  imageUrl: string;
  courseId: string | null;
  isActive: boolean;
}

export async function fetchAllBanners(): Promise<AdminBanner[]> {
  const rows = await run(
    supabase()
      .from('banners')
      .select('id, image_path, course_id, is_active')
      .order('position')
      .order('created_at'),
  );
  const urls = fileUrls();
  return rows.map((row) => ({
    id: row.id,
    imagePath: row.image_path,
    imageUrl: urls.mediaUrl(row.image_path, IMAGE_WIDTHS.banner),
    courseId: row.course_id,
    isActive: row.is_active,
  }));
}

export async function addBanner(file: PickedFile, position: number): Promise<void> {
  const url = await storeImage('banner', file);
  try {
    await runVoid(supabase().from('banners').insert({ image_path: url, position }));
  } catch (error) {
    await removeImages([url]);
    throw error;
  }
}

export async function updateBanner(
  bannerId: string,
  changes: { isActive?: boolean; courseId?: string | null },
) {
  await runVoid(
    supabase()
      .from('banners')
      .update({
        ...(changes.isActive !== undefined ? { is_active: changes.isActive } : {}),
        ...(changes.courseId !== undefined ? { course_id: changes.courseId } : {}),
      })
      .eq('id', bannerId),
  );
}

export async function saveBannerOrder(bannerIds: string[]): Promise<void> {
  const db = supabase();
  await Promise.all(
    bannerIds.map((id, index) =>
      runVoid(db.from('banners').update({ position: index }).eq('id', id)),
    ),
  );
}

export async function deleteBanner(banner: Pick<AdminBanner, 'id' | 'imagePath'>): Promise<void> {
  await runVoid(supabase().from('banners').delete().eq('id', banner.id));
  await removeImages([banner.imagePath]);
}

export async function saveSettings(values: SettingsFormValues): Promise<void> {
  await runVoid(supabase().from('app_settings').update(settingsFormToRow(values)).eq('id', 1));
}
