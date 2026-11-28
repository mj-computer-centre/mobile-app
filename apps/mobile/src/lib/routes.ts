import type { Href } from 'expo-router';

/**
 * Every in-app address in one place. Screens navigate with these instead of typing paths, so a
 * renamed route is a one-line change.
 */
export const routes = {
  home: '/' as Href,
  courses: '/courses' as Href,
  tests: '/tests' as Href,
  contact: '/contact' as Href,
  profile: '/profile' as Href,
  signIn: '/sign-in' as Href,
  completeProfile: '/complete-profile' as Href,
  privacy: '/privacy' as Href,
  deleteAccountInfo: '/delete-account' as Href,
  course: (courseId: string) => ({ pathname: '/course/[courseId]', params: { courseId } }) as Href,
  lesson: (courseId: string, lessonId: string, sectionId?: string) =>
    ({
      pathname: '/lesson/[lessonId]',
      params: { lessonId, courseId, ...(sectionId ? { sectionId } : {}) },
    }) as Href,
  notes: (courseId: string, lessonId: string) =>
    ({ pathname: '/notes/[lessonId]', params: { lessonId, courseId } }) as Href,
  /** A test's page: what it is before it is taken, the result afterwards. */
  test: (testId: string) => ({ pathname: '/test/[testId]', params: { testId } }) as Href,
  /** Answering the questions. */
  takeTest: (testId: string) => ({ pathname: '/test/[testId]/take', params: { testId } }) as Href,
  /** Each question with the correct answer, once the test is over. */
  reviewTest: (testId: string) =>
    ({ pathname: '/test/[testId]/review', params: { testId } }) as Href,
  admin: {
    home: '/admin' as Href,
    newCourse: '/manage/course/new' as Href,
    course: (courseId: string) =>
      ({ pathname: '/manage/course/[courseId]', params: { courseId } }) as Href,
    section: (sectionId: string, courseId?: string) =>
      ({
        pathname: '/manage/section/[sectionId]',
        params: { sectionId, ...(courseId ? { courseId } : {}) },
      }) as Href,
    library: '/manage/library' as Href,
    tests: '/manage/tests' as Href,
    newTest: '/manage/test/new' as Href,
    test: (testId: string) => ({ pathname: '/manage/test/[testId]', params: { testId } }) as Href,
    testResults: (testId: string) =>
      ({ pathname: '/manage/test/[testId]/results', params: { testId } }) as Href,
    /** One student's answers, as staff see them. */
    testAttempt: (testId: string, attemptId: string) =>
      ({
        pathname: '/manage/test/[testId]/attempt/[attemptId]',
        params: { testId, attemptId },
      }) as Href,
    students: '/manage/students' as Href,
    banners: '/manage/banners' as Href,
    settings: '/manage/settings' as Href,
    staff: '/manage/staff' as Href,
  },
} as const;
