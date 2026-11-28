import { useLocalSearchParams } from 'expo-router';

import { TakeTestScreen } from '@/features/tests';

export default function TakeTestRoute() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  return <TakeTestScreen testId={testId} />;
}
