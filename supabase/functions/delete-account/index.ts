// POST → permanently deletes the caller's account and profile (Google Play requires in-app
// account deletion). The database refuses to delete the centre's last owner.
import { requireUser, serviceClient } from '../_shared/auth.ts';
import { errorResponse, json, preflight } from '../_shared/http.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return errorResponse('unknown', 405);

  const caller = await requireUser(req);
  if (caller instanceof Response) return caller;

  const { error } = await serviceClient().auth.admin.deleteUser(caller.userId);
  if (error) {
    if (error.message.includes('mcc:last_owner')) return errorResponse('last_owner', 409);
    console.error('delete-account: deleteUser failed', error.message);
    return errorResponse('unknown', 500);
  }
  return json({ deleted: true });
});
