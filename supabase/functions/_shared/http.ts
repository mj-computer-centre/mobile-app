// Response helpers shared by every edge function. Error bodies are `{ error: { code } }` with a
// code from packages/shared/src/errors.ts, so the app shows the same message as for DB errors.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  | 'unknown';

export function errorResponse(code: ErrorCode, status: number): Response {
  return json({ error: { code } }, status);
}
