// POST ?kind=course|banner, with the picture's bytes as the body → { url } : stores a course
// cover or a home banner on Cloudinary and returns where it now lives. Staff only. The app then
// saves the URL on the course or banner itself, under the usual access rules.
// Response shape: uploadImageResponseSchema in packages/shared.
import { requireStaff } from '../_shared/auth.ts';
import {
  cloudinaryConfig,
  isImageKind,
  MAX_IMAGE_BYTES,
  storeImage,
} from '../_shared/cloudinary.ts';
import { errorResponse, json, preflight, readBytes } from '../_shared/http.ts';
import { sniffImageType } from '../_shared/image-type.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return errorResponse('unknown', 405);

  const caller = await requireStaff(req);
  if (caller instanceof Response) return caller;

  const kind = new URL(req.url).searchParams.get('kind');
  if (!isImageKind(kind)) return errorResponse('image_not_accepted', 400);

  const config = cloudinaryConfig((name) => Deno.env.get(name));
  if (!config) {
    console.error('upload-image: the CLOUDINARY_* secrets are not set');
    return errorResponse('images_not_set_up', 503);
  }

  const bytes = await readBytes(req, MAX_IMAGE_BYTES);
  if (!bytes) return errorResponse('file_too_large', 413);
  const type = sniffImageType(bytes);
  if (!type) return errorResponse('image_not_accepted', 415);

  const url = await storeImage(config, kind, bytes, type);
  return url ? json({ url }) : errorResponse('image_upload_failed', 502);
});
