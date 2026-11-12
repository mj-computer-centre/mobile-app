import { toCsv, type StaffRole, type ViewRow } from '@mcc/shared';

import { run, runVoid } from '@/lib/data';
import { saveTextFile } from '@/lib/platform/save-text-file';
import { supabase } from '@/lib/supabase';

export type Student = ViewRow<'student_directory'>;
export type StaffMember = ViewRow<'staff_directory'>;

const PAGE_SIZE = 1000; // PostgREST's default maximum rows per request

/** Every student, newest first, fetched a page at a time. */
export async function fetchStudents(): Promise<Student[]> {
  const all: Student[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = await run(
      supabase()
        .from('student_directory')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1),
    );
    all.push(...page);
    if (page.length < PAGE_SIZE) return all;
  }
}

function formatDate(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
}

/** Downloads (web) or shares (phone) the students list as a CSV that opens in Excel. */
export async function exportStudentsCsv(students: Student[]): Promise<void> {
  const csv = toCsv(students, [
    { header: 'Name', value: (s) => s.full_name },
    { header: 'Mobile', value: (s) => s.phone },
    { header: 'Email', value: (s) => s.email },
    { header: 'Village or town', value: (s) => s.city },
    { header: 'Interested in', value: (s) => s.interested_course_title },
    { header: 'Joined', value: (s) => formatDate(s.created_at) },
  ]);
  const stamp = new Date().toISOString().slice(0, 10);
  await saveTextFile(`students-${stamp}.csv`, csv, 'text/csv');
}

export async function fetchStaff(): Promise<StaffMember[]> {
  return run(supabase().from('staff_directory').select('*').order('created_at'));
}

export async function addStaff(email: string, role: StaffRole): Promise<void> {
  await run(supabase().rpc('add_staff_by_email', { p_email: email.trim(), p_role: role }));
}

export async function removeStaff(userId: string): Promise<void> {
  await runVoid(supabase().rpc('remove_staff', { p_user_id: userId }));
}

export interface DashboardStats {
  studentsTotal: number;
  studentsLast7Days: number;
  coursesPublished: number;
  coursesTotal: number;
  lessonsTotal: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const rows = await run(supabase().rpc('admin_dashboard_stats'));
  const row = rows[0];
  return {
    studentsTotal: row?.students_total ?? 0,
    studentsLast7Days: row?.students_last_7_days ?? 0,
    coursesPublished: row?.courses_published ?? 0,
    coursesTotal: row?.courses_total ?? 0,
    lessonsTotal: row?.lessons_total ?? 0,
  };
}
