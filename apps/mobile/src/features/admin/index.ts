// The admin panel: staff manage courses, units, lessons, banners, contact details and staff.
// The same screens run inside the app (Admin tab) and on the admin website.
export { AdminHomeScreen } from './dashboard/admin-home-screen';
export { CourseEditorScreen } from './courses/course-editor-screen';
export { NewCourseScreen } from './courses/new-course-screen';
export { SectionEditorScreen } from './sections/section-editor-screen';
export { LibraryScreen } from './library/library-screen';
export { StudentsScreen } from './people/students-screen';
export { StaffScreen } from './people/staff-screen';
export { BannersScreen } from './home-content/banners-screen';
export { SettingsScreen } from './home-content/settings-screen';
export { NewTestScreen } from './tests/new-test-screen';
export { TestAttemptScreen } from './tests/test-attempt-screen';
export { TestEditorScreen } from './tests/test-editor-screen';
export { TestResultsScreen } from './tests/test-results-screen';
export { TestsAdminScreen } from './tests/tests-admin-screen';

// Query keys and data shapes, for code that fills the cache (dev-bypass demo data).
export { adminKeys } from './shared/keys';
export type { CourseRecord } from './courses/api';
export type { SectionDetail, LibrarySection } from './sections/api';
export type { LibraryLesson } from './lessons/api';
export type { DashboardStats, StaffMember, Student } from './people/api';
export type { AdminBanner } from './home-content/api';
