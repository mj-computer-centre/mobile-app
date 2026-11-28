// POST { urls } → { removed } : removes pictures from Cloudinary that nothing uses any more (a
// replaced course cover, a deleted banner). Staff only. A URL is skipped, not refused, when it
// is not one of this app's pictures or a course or banner still shows it, so a mistake in the
// app can never take a picture that is in use. Shapes: removeImagesRequestSchema and
// removeImagesResponseSchema in packages/shared.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.118.0';

import { requireStaff } from '../_shared/auth.ts';
import {
  cloudinaryConfig,
  MAX_IMAGES_PER_REMOVAL,
  ownPublicId,
  removeImage,
} from '../_shared/cloudinary.ts';
import { errorResponse, json, preflight } from '../_shared/http.ts';

/** Staff can read every course and banner, so the caller's own client sees all uses. */
async function isInUse(client: SupabaseClient, url: string): Promise<boolean> {
  const [courses, banners] = await Promise.all([
    client.from('courses').select('id', { count: 'exact', head: true }).eq('thumbnail_path', url),
    client.from('banners').select('id', { count: 'exact', head: true }).eq('image_path', url),
  ]);
  // When it cannot be checked, the picture stays.
  if (courses.error || banners.error) return true;
  return (courses.count ?? 0) + (banners.count ?? 0) > 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return errorResponse('unknown', 405);

  const caller = await requireStaff(req);
  if (caller instanceof Response) return caller;

  const body = await req.json().catch(() => null);
  const urls: unknown = body?.urls;
  if (
    !Array.isArray(urls) ||
    urls.length === 0 ||
    urls.length > MAX_IMAGES_PER_REMOVAL ||
    !urls.every((url) => typeof url === 'string' && url.length <= 300)
  ) {
    return errorResponse('unknown', 400);
  }

  const config = cloudinaryConfig((name) => Deno.env.get(name));
  if (!config) {
    console.error('remove-images: the CLOUDINARY_* secrets are not set');
    return errorResponse('images_not_set_up', 503);
  }

  let removed = 0;
  for (const url of new Set(urls as string[])) {
    const publicId = ownPublicId(url, config);
    if (!publicId || (await isInUse(caller.client, url))) continue;
    if (await removeImage(config, publicId)) removed += 1;
  }
  return json({ removed });
});
