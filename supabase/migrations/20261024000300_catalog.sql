-- Catalog: courses, reusable units (sections), reusable lessons, home banners and contact settings.
--
-- Shape (docs/architecture/data-model.md):
--   course ──< course_sections >── section ──< section_lessons >── lesson
-- A section ("unit") is created once and can sit in many courses; a lesson can sit in many
-- sections. Positions are per parent and kept gap-free by the ordering functions.

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  short_description text not null default '' check (char_length(short_description) <= 500),
  thumbnail_path text check (char_length(thumbnail_path) <= 300),
  duration_text text not null default '' check (char_length(duration_text) <= 40),
  -- Money is integer paise. original_price is the crossed-out "was" price on the course card.
  original_price_paise integer check (original_price_paise >= 0),
  price_paise integer not null default 0 check (price_paise >= 0),
  is_paid boolean not null default false,
  about_points text[] not null default '{}' check (cardinality(about_points) <= 12),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_sections (
  course_id uuid not null references public.courses (id) on delete cascade,
  section_id uuid not null references public.sections (id) on delete cascade,
  position integer not null check (position >= 0),
  primary key (course_id, section_id),
  -- Deferred so a reorder can permute positions inside one statement.
  constraint course_sections_position_unique unique (course_id, position) deferrable initially deferred
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  kind public.lesson_kind not null,
  title text not null check (char_length(title) between 1 and 200),
  youtube_video_id text check (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  duration_seconds integer check (duration_seconds >= 0),
  thumbnail_url text check (char_length(thumbnail_url) <= 500),
  pdf_path text check (char_length(pdf_path) <= 300),
  pdf_size_bytes integer check (pdf_size_bytes > 0),
  -- Topic-wise notes: a PDF lesson attached to this video.
  notes_lesson_id uuid references public.lessons (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_kind_shape check (
    (kind = 'video' and youtube_video_id is not null and pdf_path is null and pdf_size_bytes is null)
    or (kind = 'pdf' and pdf_path is not null and youtube_video_id is null and notes_lesson_id is null)
  ),
  constraint lessons_notes_not_self check (notes_lesson_id <> id),
  -- One library entry per YouTube video; adding the same link again reuses it. A plain unique
  -- constraint (NULLs never clash) rather than a partial index, so upserts can target it.
  constraint lessons_youtube_video_id_unique unique (youtube_video_id)
);

create table public.section_lessons (
  section_id uuid not null references public.sections (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  position integer not null check (position >= 0),
  primary key (section_id, lesson_id),
  constraint section_lessons_position_unique unique (section_id, position) deferrable initially deferred
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  image_path text not null check (char_length(image_path) <= 300),
  course_id uuid references public.courses (id) on delete set null,
  position integer not null default 0 check (position >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exactly one row: the centre's contact details, shown on the Contact tab.
create table public.app_settings (
  id smallint primary key default 1 check (id = 1),
  centre_name text not null default 'Mishra Computer Centre' check (char_length(centre_name) <= 120),
  phone text check (phone ~ '^[6-9][0-9]{9}$'),
  whatsapp text check (whatsapp ~ '^[6-9][0-9]{9}$'),
  email text check (char_length(email) <= 320),
  address text check (char_length(address) <= 500),
  map_url text check (char_length(map_url) <= 500),
  timings text check (char_length(timings) <= 200),
  youtube_url text check (char_length(youtube_url) <= 500),
  facebook_url text check (char_length(facebook_url) <= 500),
  instagram_url text check (char_length(instagram_url) <= 500),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values (1);

alter table public.profiles
  add constraint profiles_interested_course_id_fkey
  foreign key (interested_course_id) references public.courses (id) on delete set null;

-- Foreign-key indexes (the primary keys cover the leading columns).
create index course_sections_section_id_idx on public.course_sections (section_id);
create index section_lessons_lesson_id_idx on public.section_lessons (lesson_id);
create index lessons_notes_lesson_id_idx on public.lessons (notes_lesson_id) where notes_lesson_id is not null;
create index banners_course_id_idx on public.banners (course_id) where course_id is not null;
create index profiles_interested_course_id_idx on public.profiles (interested_course_id);
create index courses_published_sort_idx on public.courses (sort_order, created_at) where is_published;

-- updated_at triggers.
create trigger courses_set_updated_at before update on public.courses
  for each row execute function private.set_updated_at();
create trigger sections_set_updated_at before update on public.sections
  for each row execute function private.set_updated_at();
create trigger lessons_set_updated_at before update on public.lessons
  for each row execute function private.set_updated_at();
create trigger banners_set_updated_at before update on public.banners
  for each row execute function private.set_updated_at();
create trigger app_settings_set_updated_at before update on public.app_settings
  for each row execute function private.set_updated_at();

-- A video's notes must point at a PDF lesson.
create or replace function private.enforce_notes_lesson_is_pdf()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.notes_lesson_id is not null and not exists (
    select 1 from public.lessons where id = new.notes_lesson_id and kind = 'pdf'
  ) then
    perform private.fail('notes_must_be_pdf');
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_notes_lesson_is_pdf() from public;

create trigger lessons_enforce_notes_is_pdf
  before insert or update of notes_lesson_id on public.lessons
  for each row execute function private.enforce_notes_lesson_is_pdf();
