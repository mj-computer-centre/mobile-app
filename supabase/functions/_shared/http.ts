// Response helpers shared by every edge function. Error bodies are `{ error: { code } }` with a
// code from packages/shared/src/errors.ts, so the app shows the same message as for DB errors.

// The allowed headers are every header the Supabase client can send (the list it publishes as
// `@supabase/supabase-js/cors`): a header missing here makes the browser refuse the call.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function preflight(): Response {
  return new Response('ok', { headers: corsHeaders });
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export type ErrorCode =
  | 'staff_only'
  | 'not_signed_in'
  | 'last_owner'
  | 'invalid_youtube_link'
  | 'youtube_not_found'
  | 'youtube_unavailable'
  | 'ai_images_not_set_up'
  | 'ai_images_used_up'
  | 'ai_images_failed'
  | 'images_not_set_up'
  | 'image_not_accepted'
  | 'image_upload_failed'
  | 'file_too_large'
  | 'unknown';

export function errorResponse(code: ErrorCode, status: number): Response {
  return json({ error: { code } }, status);
}

/**
 * The request's body as bytes, or null as soon as it passes `maxBytes`: the rest is not read,
 * so an oversized upload cannot fill the function's memory whatever its headers claim.
 */
export async function readBytes(
  req: Request,
  maxBytes: number,
): Promise<Uint8Array<ArrayBuffer> | null> {
  if (Number(req.headers.get('content-length') ?? 0) > maxBytes) return null;
  if (!req.body) return new Uint8Array(0);
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
