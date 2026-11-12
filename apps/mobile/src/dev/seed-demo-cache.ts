// Fills the React Query cache with demo data for the dev-bypass mode, so every screen renders
// without a backend. Reads come from the cache; anything not seeded, and every save, fails with
// the "demo_mode" message because src/lib/supabase.ts refuses to create a client.
import type { QueryClient, QueryKey } from '@tanstack/react-query';

import {
  adminKeys,
  type DashboardStats,
  type LibraryLesson,
  type LibrarySection,
  type SectionDetail,
  type StaffMember,
  type Student,
} from '@/features/admin';
import { catalogKeys } from '@/features/catalog';
import { settingsKeys, type CentreSettings } from '@/features/contact';
import { profileKeys, type Profile } from '@/features/profile';
import { DEV_USER_ID, type DevBypassRole } from '@/lib/dev-bypass';

import {
  demoCourses,
  demoId,
  demoLessons,
  demoSections,
  toDetail,
  toSummary,
} from './demo-content';

const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;
const NOW = '2026-10-24T09:00:00.000Z';

function demoProfile(role: DevBypassRole): Profile {
  return {
    id: DEV_USER_ID,
    full_name: role === 'student' ? 'Dev Student' : role === 'owner' ? 'Dev Owner' : 'Dev Admin',
    email: 'dev@example.com',
    phone: null,
    city: 'Makhdumpur',
    interested_course_id: demoId(2),
    profile_completed_at: NOW,
  };
}

const demoSettings: CentreSettings = {
  id: 1,
  centre_name: 'Mishra Computer Centre (demo)',
  phone: null,
  whatsapp: null,
  email: null,
  address: 'Near Government School, Makhdumpur, Jehanabad',
  map_url: null,
  timings: 'Demo timings: Mon–Sat, 8 am – 6 pm',
  youtube_url: null,
  facebook_url: null,
  instagram_url: null,
  updated_at: NOW,
};

function courseCount(sectionId: string): number {
  return demoCourses.filter((c) => c.units.some((unit) => unit.id === sectionId)).length;
}

function libraryLessons(): LibraryLesson[] {
  return demoLessons.map((lesson) => ({
    id: lesson.id,
    kind: lesson.kind,
    title: lesson.title,
    youtubeVideoId: lesson.kind === 'video' ? lesson.youtubeVideoId : null,
    pdfPath: lesson.kind === 'pdf' ? `${lesson.id}.pdf` : null,
    sectionCount: demoSections.filter((s) => s.lessons.some((l) => l.id === lesson.id)).length,
    attachedToVideoCount: demoLessons.filter((l) => l.kind === 'video' && l.notes?.id === lesson.id)
      .length,
  }));
}

const demoStudents: Student[] = [1, 2, 3].map((n) => ({
  id: demoId(900 + n),
  full_name: `Demo Student ${n}`,
  email: `student${n}@example.com`,
  phone: null,
  city: n === 1 ? 'Makhdumpur' : 'Jehanabad',
  interested_course_id: demoId(n === 3 ? 1 : 2),
  interested_course_title: n === 3 ? 'Basic Computer' : 'DCA',
  profile_completed_at: NOW,
  created_at: NOW,
}));

export function seedDemoCache(queryClient: QueryClient, role: DevBypassRole): void {
  // Seeded data never goes stale or gets garbage-collected, so it is never refetched.
  queryClient.setDefaultOptions({
    ...queryClient.getDefaultOptions(),
    queries: { ...queryClient.getDefaultOptions().queries, gcTime: Infinity, retry: false },
  });
  const set = (key: QueryKey, data: unknown) =>
    queryClient.setQueryData(key, data, { updatedAt: Date.now() + TEN_YEARS_MS });

  const published = demoCourses.filter((c) => c.record.is_published);
  set(profileKeys.mine(DEV_USER_ID), demoProfile(role));
  set(settingsKeys.all, demoSettings);
  set(catalogKeys.courses(false), published.map(toSummary));
  set(catalogKeys.courses(true), demoCourses.map(toSummary));
  set(catalogKeys.banners, []);
  set(
    catalogKeys.courseOptions,
    published.map((c) => ({ id: c.record.id, title: c.record.title })),
  );
  for (const demo of demoCourses) set(catalogKeys.course(demo.record.id), toDetail(demo));

  if (role === 'student') return;

  const stats: DashboardStats = {
    studentsTotal: demoStudents.length,
    studentsLast7Days: 2,
    coursesPublished: published.length,
    coursesTotal: demoCourses.length,
    lessonsTotal: demoLessons.length,
  };
  const staff: StaffMember[] = [
    {
      user_id: DEV_USER_ID,
      role,
      created_at: NOW,
      full_name: demoProfile(role).full_name,
      email: 'dev@example.com',
    },
  ];
  const librarySections: LibrarySection[] = demoSections.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    courseCount: courseCount(s.id),
  }));

  set(adminKeys.dashboard, stats);
  set(adminKeys.students, demoStudents);
  set(adminKeys.staff, staff);
  set(adminKeys.banners, []);
  set(adminKeys.sections, librarySections);
  set(adminKeys.lessons, libraryLessons());
  for (const demo of demoCourses) set(adminKeys.course(demo.record.id), demo.record);
  for (const section of demoSections) {
    const detail: SectionDetail = {
      id: section.id,
      title: section.title,
      description: section.description,
      lessons: section.lessons,
    };
    set(adminKeys.section(section.id), detail);
  }
}
