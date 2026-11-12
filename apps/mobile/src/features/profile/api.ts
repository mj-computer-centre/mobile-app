import { completeProfileToUpdate, type CompleteProfileValues, type TableRow } from '@mcc/shared';
import { z } from 'zod';

import { invokeFunction, run, runVoid } from '@/lib/data';
import { supabase } from '@/lib/supabase';

export type Profile = Pick<
  TableRow<'profiles'>,
  'id' | 'full_name' | 'email' | 'phone' | 'city' | 'interested_course_id' | 'profile_completed_at'
>;

export async function fetchMyProfile(userId: string): Promise<Profile> {
  return run(
    supabase()
      .from('profiles')
      .select('id, full_name, email, phone, city, interested_course_id, profile_completed_at')
      .eq('id', userId)
      .single(),
  );
}

export async function saveMyProfile(userId: string, values: CompleteProfileValues): Promise<void> {
  await runVoid(
    supabase().from('profiles').update(completeProfileToUpdate(values)).eq('id', userId),
  );
}

const deleteAccountResponse = z.object({ deleted: z.literal(true) });

/** Permanently deletes the account through the delete-account edge function. */
export async function deleteMyAccount(): Promise<void> {
  await invokeFunction('delete-account', {}, deleteAccountResponse);
}
