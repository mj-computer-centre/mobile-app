import { EMPTY_COURSE_FORM } from '@mcc/shared';
import { router } from 'expo-router';
import { useState } from 'react';

import { showMessage } from '@/lib/platform/confirm';
import type { PickedFile } from '@/lib/platform/picked-file';
import { routes } from '@/lib/routes';
import { AppText, Card, Screen } from '@/ui';

import { CourseDetailsForm } from './components/course-details-form';
import { CoverPicker } from './components/cover-picker';
import { useCreateCourse } from './hooks';

export function NewCourseScreen() {
  const create = useCreateCourse();
  // Chosen here, stored only when the course is created: nothing is uploaded for a course the
  // admin never saves.
  const [cover, setCover] = useState<PickedFile | null>(null);

  return (
    <Screen edges={[]}>
      <AppText color="textMuted">
        Start with the details and, if you like, a cover picture. After saving you can add the
        course’s units.
      </AppText>
      <Card>
        <CourseDetailsForm
          initialValues={EMPTY_COURSE_FORM}
          submitLabel="Create course"
          saving={create.isPending}
          error={create.error}
          renderCover={(typed) => (
            <CoverPicker
              title={typed.title}
              description={typed.description}
              imageUri={cover?.uri ?? null}
              busy={create.isPending}
              onPick={setCover}
              onRemove={cover ? () => setCover(null) : undefined}
            />
          )}
          onSubmit={(values) =>
            create.mutate(
              { values, cover },
              {
                onSuccess: ({ courseId, coverSaved }) => {
                  router.replace(routes.admin.course(courseId));
                  if (!coverSaved) {
                    showMessage(
                      'The course is created',
                      'Its picture could not be saved. Add it again on this page.',
                    );
                  }
                },
              },
            )
          }
        />
      </Card>
    </Screen>
  );
}
