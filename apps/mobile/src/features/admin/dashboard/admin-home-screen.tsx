import { moveItem } from '@mcc/shared';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useStaffRole } from '@/features/auth';
import { useCourses } from '@/features/catalog';
import { routes } from '@/lib/routes';
import {
  AppText,
  Badge,
  Button,
  Card,
  ErrorState,
  ListRow,
  LoadingState,
  Screen,
  spacing,
} from '@/ui';

import { useSaveCourseOrder } from '../courses/hooks';
import { useDashboardStats } from '../people/hooks';
import { AdminSection } from '../shared/admin-section';
import { ReorderControls } from '../shared/reorder-controls';

export function AdminHomeScreen() {
  const role = useStaffRole();
  const stats = useDashboardStats();
  const courses = useCourses({ includeDrafts: true });
  const saveOrder = useSaveCourseOrder();

  return (
    <Screen
      edges={[]}
      refreshing={stats.isRefetching || courses.isRefetching}
      onRefresh={() => {
        void stats.refetch();
        void courses.refetch();
      }}>
      <AppText variant="title">Admin</AppText>

      <View style={styles.stats}>
        <Stat label="Students" value={stats.data?.studentsTotal} />
        <Stat label="New this week" value={stats.data?.studentsLast7Days} />
        <Stat label="Live courses" value={stats.data?.coursesPublished} />
        <Stat label="Lessons" value={stats.data?.lessonsTotal} />
      </View>

      <AdminSection
        title="Courses"
        description="Tap a course to edit its details and units."
        padded={false}>
        {courses.isPending ? (
          <LoadingState />
        ) : courses.isError ? (
          <ErrorState error={courses.error} onRetry={() => void courses.refetch()} />
        ) : (
          courses.data.map((course, index) => (
            <ListRow
              key={course.id}
              title={course.title}
              subtitle={course.isPublished ? 'Live' : 'Draft — students can’t see it'}
              onPress={() => router.push(routes.admin.course(course.id))}
              trailing={
                <ReorderControls
                  itemLabel={course.title}
                  index={index}
                  count={courses.data.length}
                  disabled={saveOrder.isPending}
                  onMove={(from, to) =>
                    saveOrder.mutate(moveItem(courses.data, from, to).map((item) => item.id))
                  }
                />
              }
            />
          ))
        )}
        <View style={styles.padded}>
          <Button
            label="New course"
            icon="plus"
            onPress={() => router.push(routes.admin.newCourse)}
          />
        </View>
      </AdminSection>

      <AdminSection title="Manage" padded={false}>
        <ListRow
          title="Library"
          subtitle="Every unit, video and PDF"
          onPress={() => router.push(routes.admin.library)}
          navigates
        />
        <ListRow
          title="Students"
          subtitle="Who signed up; download the list"
          onPress={() => router.push(routes.admin.students)}
          navigates
        />
        <ListRow
          title="Home banners"
          subtitle="Pictures at the top of the Home screen"
          onPress={() => router.push(routes.admin.banners)}
          navigates
        />
        <ListRow
          title="Contact details"
          subtitle="Phone, WhatsApp, address, timings"
          onPress={() => router.push(routes.admin.settings)}
          navigates
        />
        {role === 'owner' ? (
          <ListRow
            title="Staff"
            subtitle="Who can manage content"
            onPress={() => router.push(routes.admin.staff)}
            navigates
          />
        ) : null}
      </AdminSection>

      {role ? (
        <Badge
          label={role === 'owner' ? 'Signed in as owner' : 'Signed in as admin'}
          tone="primary"
        />
      ) : null}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <Card style={styles.stat}>
      <AppText variant="title">{value ?? '–'}</AppText>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: { flexGrow: 1, flexBasis: '45%', gap: 2 },
  padded: { padding: spacing.lg },
});
