import { Stack } from 'expo-router';

/** Admin screens beyond the Admin tab. Only reachable by staff (see the root layout's gate). */
export default function ManageLayout() {
  return (
    <Stack>
      <Stack.Screen name="course/new" options={{ title: 'New course' }} />
      <Stack.Screen name="course/[courseId]" options={{ title: 'Edit course' }} />
      <Stack.Screen name="section/[sectionId]" options={{ title: 'Edit unit' }} />
      <Stack.Screen name="library" options={{ title: 'Library' }} />
      <Stack.Screen name="students" options={{ title: 'Students' }} />
      <Stack.Screen name="banners" options={{ title: 'Home banners' }} />
      <Stack.Screen name="settings" options={{ title: 'Contact details' }} />
      <Stack.Screen name="staff" options={{ title: 'Staff' }} />
    </Stack>
  );
}
