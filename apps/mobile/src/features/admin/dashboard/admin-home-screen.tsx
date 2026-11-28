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
  IconChip,
  ListGroup,
  ListRow,
  Screen,
  SkeletonRows,
  spacing,
  Stat,
  useLayout,
  type IconName,
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
  const { isWide } = useLayout();

  const figures: { label: string; value: number | undefined }[] = [
    { label: 'Students', value: stats.data?.studentsTotal },
    { label: 'New this week', value: stats.data?.studentsLast7Days },
    { label: 'Live courses', value: stats.data?.coursesPublished },
    { label: 'Lessons', value: stats.data?.lessonsTotal },
    { label: 'Tests students can see', value: stats.data?.testsPublished },
    { label: 'Tests taken', value: stats.data?.attemptsTotal },
  ];

  const coursesSection = (
    <AdminSection
      title="Courses"
      description="Open a course to edit its details and units. The arrows change the order students see."
      bare>
      {courses.isPending ? (
        <SkeletonRows />
      ) : courses.isError ? (
        <ErrorState error={courses.error} onRetry={() => void courses.refetch()} />
      ) : courses.data.length === 0 ? (
        <AppText color="textMuted">No courses yet. Create the first one below.</AppText>
      ) : (
        <ListGroup>
          {courses.data.map((course, index) => (
            <ListRow
              key={course.id}
              title={course.title}
              subtitle={course.isPublished ? 'Live' : 'Draft: students can’t see it'}
              leading={
                <IconChip
                  name={course.isPublished ? 'school-outline' : 'pencil-outline'}
                  tone={course.isPublished ? 'success' : 'warning'}
                  size={40}
                />
              }
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
          ))}
        </ListGroup>
      )}
      <Button label="New course" icon="plus" onPress={() => router.push(routes.admin.newCourse)} />
    </AdminSection>
  );

  const manageSection = (
    <AdminSection title="Manage" bare>
      <ListGroup>
        <ManageRow
          icon="clipboard-text-clock-outline"
          title="Tests"
          subtitle="Create tests, set the time, see results"
          onPress={() => router.push(routes.admin.tests)}
        />
        <ManageRow
          icon="bookshelf"
          title="Library"
          subtitle="Every unit, video and PDF"
          onPress={() => router.push(routes.admin.library)}
        />
        <ManageRow
          icon="account-group-outline"
          title="Students"
          subtitle="Who signed up; download the list"
          onPress={() => router.push(routes.admin.students)}
        />
        <ManageRow
          icon="image-multiple-outline"
          title="Home banners"
          subtitle="Pictures that slide on the Home screen"
          onPress={() => router.push(routes.admin.banners)}
        />
        <ManageRow
          icon="card-account-phone-outline"
          title="Centre details"
          subtitle="Phone, WhatsApp, address, timings, Play Store link"
          onPress={() => router.push(routes.admin.settings)}
        />
        {role === 'owner' ? (
          <ManageRow
            icon="shield-account-outline"
            title="Staff"
            subtitle="Who can manage content"
            onPress={() => router.push(routes.admin.staff)}
          />
        ) : null}
      </ListGroup>
    </AdminSection>
  );

  return (
    <Screen
      edges={[]}
      width="wide"
      refreshing={stats.isRefetching || courses.isRefetching}
      onRefresh={() => {
        void stats.refetch();
        void courses.refetch();
      }}>
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <AppText variant="title" accessibilityRole="header">
            Admin
          </AppText>
          <AppText color="textMuted">
            Courses, lessons, tests, students and the centre’s details.
          </AppText>
        </View>
        {role ? <Badge label={role === 'owner' ? 'Owner' : 'Admin'} tone="primary" /> : null}
      </View>

      {/* One surface for all the figures: two columns on a phone, a single row on a wide screen. */}
      <Card style={styles.figures}>
        {figures.map((figure) => (
          <Stat
            key={figure.label}
            value={figure.value}
            label={figure.label}
            style={isWide ? styles.figureWide : styles.figure}
          />
        ))}
      </Card>

      {isWide ? (
        <View style={styles.columns}>
          <View style={styles.main}>{coursesSection}</View>
          <View style={styles.side}>{manageSection}</View>
        </View>
      ) : (
        <>
          {coursesSection}
          {manageSection}
        </>
      )}
    </Screen>
  );
}

function ManageRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <ListRow
      title={title}
      subtitle={subtitle}
      leading={<IconChip name={icon} size={40} />}
      onPress={onPress}
      navigates
    />
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  titleText: { flex: 1, gap: spacing.xs },
  figures: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  figure: { width: '50%', paddingRight: spacing.md },
  figureWide: { flex: 1, paddingRight: spacing.md },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxl },
  main: { flex: 3, minWidth: 0 },
  side: { flex: 2, minWidth: 0 },
});
