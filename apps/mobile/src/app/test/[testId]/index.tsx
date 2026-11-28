import { useLocalSearchParams } from 'expo-router';

import { TestScreen } from '@/features/tests';

export default function TestRoute() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  return <TestScreen testId={testId} />;
}
