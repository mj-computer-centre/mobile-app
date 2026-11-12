import { EMPTY_COURSE_FORM } from '@mcc/shared';
import { router } from 'expo-router';

import { routes } from '@/lib/routes';
import { AppText, Card, Screen } from '@/ui';

import { CourseDetailsForm } from './components/course-details-form';
import { useCreateCourse } from './hooks';

export function NewCourseScreen() {
  const create = useCreateCourse();

  return (
    <Screen edges={[]}>
      <AppText color="textMuted">
        Start with the details. After saving you can add a cover picture and the course’s units.
      </AppText>
      <Card>
        <CourseDetailsForm
          initialValues={EMPTY_COURSE_FORM}
          submitLabel="Create course"
          saving={create.isPending}
          error={create.error}
          onSubmit={(values) =>
            create.mutate(values, {
              onSuccess: (courseId) => router.replace(routes.admin.course(courseId)),
            })
          }
        />
      </Card>
    </Screen>
  );
}
