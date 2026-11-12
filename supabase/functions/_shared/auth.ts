import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.118.0';

import { errorResponse } from './http.ts';

export interface Caller {
  userId: string;
  /** A client acting as the caller, so row-level security applies to anything it reads. */
  client: SupabaseClient;
}

function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

/** The signed-in user behind the request, or a 401 response. */
export async function requireUser(req: Request): Promise<Caller | Response> {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return errorResponse('not_signed_in', 401);

  const client = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(authorization.slice('Bearer '.length));
  if (error || !data.user) return errorResponse('not_signed_in', 401);
  return { userId: data.user.id, client };
}

/** Like requireUser, but only for the centre's staff (owner or admin). */
export async function requireStaff(req: Request): Promise<Caller | Response> {
  const caller = await requireUser(req);
  if (caller instanceof Response) return caller;
  const { data, error } = await caller.client
    .from('staff')
    .select('role')
    .eq('user_id', caller.userId)
    .maybeSingle();
  if (error || !data) return errorResponse('staff_only', 403);
  return caller;
}

/** A client with full rights. Only for actions the caller is already allowed to take. */
export function serviceClient(): SupabaseClient {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
