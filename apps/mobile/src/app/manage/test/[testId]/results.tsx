import { useLocalSearchParams } from 'expo-router';

import { TestResultsScreen } from '@/features/admin';

export default function TestResultsRoute() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  return <TestResultsScreen testId={testId} />;
}
