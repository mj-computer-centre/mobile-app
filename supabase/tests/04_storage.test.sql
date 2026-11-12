-- Storage buckets and who may upload.
begin;

select tests.create_user('owner@test.in') as owner_id \gset
select tests.create_user('asha@test.in') as asha_id \gset
select private.bootstrap_owner('owner@test.in');

select tests.check_equal(
  (select allowed_mime_types from storage.buckets where id = 'notes'),
  array['application/pdf'], 'the notes bucket accepts PDFs only');
select tests.check_equal(
  (select public from storage.buckets where id = 'media'), true,
  'course pictures and banners are served publicly');

select tests.act_as(:'asha_id');
select tests.check_raises(
  $$insert into storage.objects (bucket_id, name) values ('notes', 'x.pdf')$$,
  'row-level security', 'a student cannot upload notes');

select tests.act_as(:'owner_id');
insert into storage.objects (bucket_id, name) values ('notes', '00000000-0000-0000-0000-0000000000f1.pdf');
select tests.check_equal((select count(*) from storage.objects where bucket_id = 'notes'), 1::bigint,
  'staff can upload notes');
select tests.check_equal(
  tests.rows_affected($$delete from storage.objects where bucket_id = 'notes'$$), 1,
  'staff can delete notes');

rollback;
