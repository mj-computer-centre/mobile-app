import { z } from 'zod';

import type { TableRow, TableUpdate } from '../db';
import { normalizeIndianMobile } from '../profile/phone';

const optionalMobile = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || normalizeIndianMobile(value) !== null,
    'Enter a 10-digit mobile number',
  );

const optionalLink = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^https:\/\/\S+$/.test(value),
    'Paste a full link starting with https://',
  );

export const settingsFormSchema = z.object({
  centreName: z.string().trim().min(1, 'Enter the centre’s name').max(120),
  phone: optionalMobile,
  whatsapp: optionalMobile,
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || z.email().safeParse(value).success, 'Enter a valid email'),
  address: z.string().trim().max(500),
  mapUrl: optionalLink,
  timings: z.string().trim().max(200),
  youtubeUrl: optionalLink,
  facebookUrl: optionalLink,
  instagramUrl: optionalLink,
  playStoreUrl: optionalLink,
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

type SettingsRow = Omit<TableRow<'app_settings'>, 'id' | 'updated_at'>;

const orNull = (value: string) => value.trim() || null;

export function settingsFormToRow(values: SettingsFormValues): TableUpdate<'app_settings'> {
  return {
    centre_name: values.centreName.trim(),
    phone: values.phone ? normalizeIndianMobile(values.phone) : null,
    whatsapp: values.whatsapp ? normalizeIndianMobile(values.whatsapp) : null,
    email: orNull(values.email),
    address: orNull(values.address),
    map_url: orNull(values.mapUrl),
    timings: orNull(values.timings),
    youtube_url: orNull(values.youtubeUrl),
    facebook_url: orNull(values.facebookUrl),
    instagram_url: orNull(values.instagramUrl),
    play_store_url: orNull(values.playStoreUrl),
  };
}

export function settingsRowToForm(row: SettingsRow): SettingsFormValues {
  return {
    centreName: row.centre_name,
    phone: row.phone ?? '',
    whatsapp: row.whatsapp ?? '',
    email: row.email ?? '',
    address: row.address ?? '',
    mapUrl: row.map_url ?? '',
    timings: row.timings ?? '',
    youtubeUrl: row.youtube_url ?? '',
    facebookUrl: row.facebook_url ?? '',
    instagramUrl: row.instagram_url ?? '',
    playStoreUrl: row.play_store_url ?? '',
  };
}
