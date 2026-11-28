import { useLocalSearchParams } from 'expo-router';

import { TestAttemptScreen } from '@/features/admin';

export default function TestAttemptRoute() {
  const { testId, attemptId } = useLocalSearchParams<{ testId: string; attemptId: string }>();
  return <TestAttemptScreen testId={testId} attemptId={attemptId} />;
}
