-- Storage buckets.
--
-- notes: PDF notes, path `<lesson id>.pdf`.
-- media: course pictures and home banners, paths `courses/<course id>/<file>` and `banners/<file>`.
--
-- Both buckets are public-read while every course is free, so files are served from the CDN
-- with a plain URL. Paths contain random UUIDs. When paid courses arrive (backlog PAY-03), notes
-- for paid courses move to a private bucket with signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('notes', 'notes', true, 52428800, array['application/pdf']),
  ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "notes and media: anyone signed in reads"
  on storage.objects for select to authenticated
  using (bucket_id in ('notes', 'media'));

create policy "notes and media: staff upload"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('notes', 'media') and (select private.is_staff()));

create policy "notes and media: staff replace"
  on storage.objects for update to authenticated
  using (bucket_id in ('notes', 'media') and (select private.is_staff()))
  with check (bucket_id in ('notes', 'media') and (select private.is_staff()));

create policy "notes and media: staff delete"
  on storage.objects for delete to authenticated
  using (bucket_id in ('notes', 'media') and (select private.is_staff()));
