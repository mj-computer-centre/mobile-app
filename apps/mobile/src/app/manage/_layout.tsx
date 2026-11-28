import { Stack } from 'expo-router';

import { useHeaderOptions } from '@/app-shell/header-options';
import { useTheme } from '@/ui';

/** Admin screens beyond the Admin tab. Only reachable by staff (see the root layout's gate). */
export default function ManageLayout() {
  const header = useHeaderOptions();
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ ...header, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="course/new" options={{ title: 'New course' }} />
      <Stack.Screen name="course/[courseId]" options={{ title: 'Edit course' }} />
      <Stack.Screen name="section/[sectionId]" options={{ title: 'Edit unit' }} />
      <Stack.Screen name="library" options={{ title: 'Library' }} />
      <Stack.Screen name="tests" options={{ title: 'Tests' }} />
      <Stack.Screen name="test/new" options={{ title: 'New test' }} />
      <Stack.Screen name="test/[testId]/index" options={{ title: 'Edit test' }} />
      <Stack.Screen name="test/[testId]/results" options={{ title: 'Results' }} />
      <Stack.Screen name="test/[testId]/attempt/[attemptId]" options={{ title: 'Answers' }} />
      <Stack.Screen name="students" options={{ title: 'Students' }} />
      <Stack.Screen name="banners" options={{ title: 'Home banners' }} />
      <Stack.Screen name="settings" options={{ title: 'Centre details' }} />
      <Stack.Screen name="staff" options={{ title: 'Staff' }} />
    </Stack>
  );
}
