// POST { title, description?, details?, view } → { image } : one AI picture for a course's
// cover, as a data URL, for the admin to choose from. Staff only. Nothing is stored: the app
// uploads the picture the admin picks like any other. Request and response shapes:
// courseImageRequestSchema and courseImageResponseSchema in packages/shared.
import { requireStaff } from '../_shared/auth.ts';
import { cloudflareConfig, drawPicture } from '../_shared/cloudflare-ai.ts';
import { COVER_VIEW_COUNT, coverPrompt } from '../_shared/cover-prompt.ts';
import { errorResponse, json, preflight } from '../_shared/http.ts';

const text = (value: unknown, max: number): string | null =>
  value === undefined || value === null
    ? ''
    : typeof value === 'string' && value.trim().length <= max
      ? value.trim()
      : null;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return errorResponse('unknown', 405);

  const caller = await requireStaff(req);
  if (caller instanceof Response) return caller;

  const body = await req.json().catch(() => null);
  const title = text(body?.title, 120);
  const description = text(body?.description, 500);
  const details = text(body?.details, 200);
  const view = body?.view ?? 0;
  if (
    !title ||
    title.length < 2 ||
    description === null ||
    details === null ||
    !Number.isInteger(view) ||
    view < 0 ||
    view >= COVER_VIEW_COUNT
  ) {
    return errorResponse('ai_images_failed', 400);
  }

  const config = cloudflareConfig();
  if (!config) {
    console.error('course-image: CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_AI_TOKEN is not set');
    return errorResponse('ai_images_not_set_up', 503);
  }

  // Counted before drawing, as the caller, so the day's limit holds even if the picture fails.
  const allowance = await caller.client.rpc('use_ai_image_allowance');
  if (allowance.error) {
    if (allowance.error.message.includes('mcc:ai_images_used_up')) {
      return errorResponse('ai_images_used_up', 429);
    }
    console.error('course-image: could not count the picture', allowance.error.message);
    return errorResponse('ai_images_failed', 500);
  }

  const drawn = await drawPicture(config, coverPrompt({ title, description, details }, view));
  if (!drawn.ok) {
    return drawn.reason === 'used_up'
      ? errorResponse('ai_images_used_up', 429)
      : errorResponse('ai_images_failed', 502);
  }
  return json({ image: drawn.image });
});
