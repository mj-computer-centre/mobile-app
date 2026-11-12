import type { TableRow } from '@mcc/shared';
import { useQuery } from '@tanstack/react-query';

import { run } from '@/lib/data';
import { supabase } from '@/lib/supabase';

export type CentreSettings = TableRow<'app_settings'>;

export const settingsKeys = {
  all: ['settings'] as const,
};

export async function fetchSettings(): Promise<CentreSettings> {
  return run(supabase().from('app_settings').select('*').eq('id', 1).single());
}

/** The centre's contact details. Read by the Contact tab; edited in admin settings. */
export function useSettings() {
  return useQuery({ queryKey: settingsKeys.all, queryFn: fetchSettings, staleTime: 10 * 60_000 });
}
