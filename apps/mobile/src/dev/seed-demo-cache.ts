// Fills the React Query cache with demo data for the dev-bypass mode, so every screen renders
// without a backend. Reads come from the cache; anything not seeded, and every save, fails with
// the "demo_mode" message because src/lib/supabase.ts refuses to create a client.
import type { CourseOutline, SiteStats } from '@mcc/shared';
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
import { siteKeys } from '@/features/site';
import { testsKeys, type MyTestsResult, type TestPaper } from '@/features/tests';
import { DEV_USER_ID, type DevBypassRole } from '@/lib/dev-bypass';

import {
  demoCourses,
  demoId,
  demoLessons,
  demoSections,
  toDetail,
  toSummary,
  type DemoCourse,
} from './demo-content';
import { buildDemoTests, demoQuestions } from './demo-tests';

const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;
const NOW = '2026-10-24T09:00:00.000Z';

function demoProfile(role: DevBypassRole): Profile {
  return {
    id: DEV_USER_ID,
    full_name: role === 'owner' ? 'Dev Owner' : role === 'admin' ? 'Dev Admin' : 'Dev Student',
    email: 'dev@example.com',
    phone: null,
    city: 'Makhdumpur',
    interested_course_id: demoId(2),
    profile_completed_at: NOW,
  };
}

// The numbers are made up (98765 43210 is the usual placeholder), so the Contact screen and the
// website show their Call and WhatsApp keys in demo mode.
const demoSettings: CentreSettings = {
  id: 1,
  centre_name: 'Mishra Computer Centre (demo)',
  phone: '9876543210',
  whatsapp: '9876543210',
  email: null,
  address: 'Near Government School, Makhdumpur, Jehanabad, Bihar',
  map_url: 'https://maps.google.com/?q=Makhdumpur',
  timings: 'Demo timings: Mon–Sat, 8 am – 6 pm',
  youtube_url: 'https://www.youtube.com/',
  facebook_url: null,
  instagram_url: null,
  play_store_url: null,
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

/** What the public website may show of a course: titles only, as the database function returns. */
function outlineOf(demo: DemoCourse): CourseOutline {
  const detail = toDetail(demo);
  const lessons = detail.units.flatMap((unit) => unit.lessons);
  const videos = lessons.filter((lesson) => lesson.kind === 'video');
  return {
    units: detail.units.map((unit) => ({
      position: unit.position,
      title: unit.title,
      description: unit.description,
      label: unit.label,
      lessons: unit.lessons.map((lesson) => ({
        title: lesson.title,
        kind: lesson.kind,
        durationSeconds: lesson.kind === 'video' ? lesson.durationSeconds : null,
      })),
    })),
    videoCount: videos.length,
    pdfCount: lessons.length - videos.length,
    totalVideoSeconds: videos.reduce(
      (sum, lesson) => sum + (lesson.kind === 'video' ? (lesson.durationSeconds ?? 0) : 0),
      0,
    ),
  };
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
  const tests = buildDemoTests(Date.now());

  // What anyone may see, signed in or not: the public website runs on these.
  const videos = demoLessons.filter((lesson) => lesson.kind === 'video').length;
  const stats: SiteStats = {
    courses: published.length,
    videos,
    notes: demoLessons.length - videos,
    tests: tests.myTests.length,
  };
  set(settingsKeys.all, demoSettings);
  set(catalogKeys.courses(false), published.map(toSummary));
  set(siteKeys.stats, stats);
  set(siteKeys.upcomingTests, tests.publicTests);
  for (const demo of published) {
    set(siteKeys.outline(demo.record.id), outlineOf(demo));
    set(siteKeys.course(demo.record.id), {
      ...toSummary(demo),
      aboutPoints: demo.record.about_points,
    });
  }

  if (role === 'visitor') return;

  set(profileKeys.mine(DEV_USER_ID), demoProfile(role));
  set(catalogKeys.courses(true), demoCourses.map(toSummary));
  set(catalogKeys.banners, []);
  set(
    catalogKeys.courseOptions,
    published.map((c) => ({ id: c.record.id, title: c.record.title })),
  );
  for (const demo of demoCourses) set(catalogKeys.course(demo.record.id), toDetail(demo));

  const myTests: MyTestsResult = { tests: tests.myTests, clockOffsetMs: 0 };
  const paper: TestPaper = {
    questions: demoQuestions.map(({ id, position, prompt, options, marks }) => ({
      id,
      position,
      prompt,
      options,
      marks,
    })),
    answers: tests.running.answers,
  };
  set(testsKeys.mine, myTests);
  set(testsKeys.paper(tests.running.testId, tests.running.attemptId), paper);
  set(testsKeys.summary(tests.finished.summary.attemptId), tests.finished.summary);
  set(testsKeys.review(tests.finished.summary.attemptId), tests.finished.review);

  if (role === 'student') return;

  const dashboard: DashboardStats = {
    studentsTotal: demoStudents.length,
    studentsLast7Days: 2,
    coursesPublished: published.length,
    coursesTotal: demoCourses.length,
    lessonsTotal: demoLessons.length,
    testsPublished: tests.myTests.length,
    testsTotal: tests.adminTests.length,
    attemptsTotal: tests.adminTests.reduce((sum, test) => sum + test.attemptCount, 0),
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

  set(adminKeys.dashboard, dashboard);
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

  set(adminKeys.tests, tests.adminTests);
  for (const record of tests.records) {
    set(adminKeys.test(record.id), record);
    set(adminKeys.testQuestions(record.id), demoQuestions);
    set(
      adminKeys.testResults(record.id),
      record.ends_at < new Date().toISOString() ? tests.results : [],
    );
  }
  // Staff open any attempt from the results list; in demo mode they all show the same answers.
  for (const result of tests.results) {
    set(testsKeys.summary(result.attemptId), {
      ...tests.finished.summary,
      attemptId: result.attemptId,
    });
    set(testsKeys.review(result.attemptId), tests.finished.review);
  }
}
