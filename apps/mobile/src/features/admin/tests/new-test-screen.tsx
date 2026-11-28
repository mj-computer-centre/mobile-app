import { newTestForm } from '@mcc/shared';
import { router } from 'expo-router';
import { useState } from 'react';

import { routes } from '@/lib/routes';
import { AppText, Screen } from '@/ui';

import { AdminSection } from '../shared/admin-section';
import { TestDetailsForm } from './components/test-details-form';
import { useCreateTest } from './hooks';

export function NewTestScreen() {
  const create = useCreateTest();
  // The starting dates depend on today, so they are worked out once, when the screen opens.
  const [initialValues] = useState(() => newTestForm());

  return (
    <Screen edges={[]}>
      <AppText color="textMuted">
        Start with the details. After saving you add the questions. The test stays a draft until you
        switch on “Show to students”.
      </AppText>
      <AdminSection title="Details">
        <TestDetailsForm
          initialValues={initialValues}
          submitLabel="Create test"
          saving={create.isPending}
          error={create.error}
          onSubmit={(values) =>
            create.mutate(values, {
              onSuccess: (testId) => router.replace(routes.admin.test(testId)),
            })
          }
        />
      </AdminSection>
    </Screen>
  );
}
