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
  ListRow,
  LoadingState,
  Screen,
  spacing,
  useLayout,
  type IconName,
} from '@/ui';

import { useSaveCourseOrder } from '../courses/hooks';
import { useDashboardStats } from '../people/hooks';
import { AdminSection } from '../shared/admin-section';
import { ReorderControls } from '../shared/reorder-controls';

type ChipTone = 'primary' | 'success' | 'warning' | 'neutral';

export function AdminHomeScreen() {
  const role = useStaffRole();
  const stats = useDashboardStats();
  const courses = useCourses({ includeDrafts: true });
  const saveOrder = useSaveCourseOrder();
  const { isWide } = useLayout();

  const coursesSection = (
    <AdminSection
      title="Courses"
      description="Open a course to edit its details and units. Arrows change the order students see."
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
            leading={
              <IconChip
                name={course.isPublished ? 'school-outline' : 'pencil-outline'}
                tone={course.isPublished ? 'success' : 'warning'}
                size={36}
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
  );

  const manageSection = (
    <AdminSection title="Manage" padded={false}>
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
        subtitle="Pictures at the top of the Home screen"
        onPress={() => router.push(routes.admin.banners)}
      />
      <ManageRow
        icon="card-account-phone-outline"
        title="Contact details"
        subtitle="Phone, WhatsApp, address, timings"
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
          <AppText variant="title">Admin</AppText>
          <AppText color="textMuted">Courses, lessons, students and the app’s Home screen.</AppText>
        </View>
        {role ? <Badge label={role === 'owner' ? 'Owner' : 'Admin'} tone="primary" /> : null}
      </View>

      <View style={styles.stats}>
        <Stat
          icon="account-group-outline"
          tone="primary"
          label="Students"
          value={stats.data?.studentsTotal}
          wide={isWide}
        />
        <Stat
          icon="account-plus-outline"
          tone="success"
          label="New this week"
          value={stats.data?.studentsLast7Days}
          wide={isWide}
        />
        <Stat
          icon="school-outline"
          tone="warning"
          label="Live courses"
          value={stats.data?.coursesPublished}
          wide={isWide}
        />
        <Stat
          icon="play-box-multiple-outline"
          tone="neutral"
          label="Lessons"
          value={stats.data?.lessonsTotal}
          wide={isWide}
        />
      </View>

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

function Stat({
  icon,
  tone,
  label,
  value,
  wide,
}: {
  icon: IconName;
  tone: ChipTone;
  label: string;
  value: number | undefined;
  wide: boolean;
}) {
  return (
    <Card style={[styles.stat, wide && styles.statWide]}>
      <IconChip name={icon} tone={tone} size={wide ? 44 : 36} />
      <View style={styles.statText}>
        <AppText variant="title">{value ?? '–'}</AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {label}
        </AppText>
      </View>
    </Card>
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
      leading={<IconChip name={icon} size={36} />}
      onPress={onPress}
      navigates
    />
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  titleText: { flex: 1, gap: 2 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statWide: { flexBasis: '22%', padding: spacing.xl },
  statText: { flex: 1, minWidth: 0 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xl },
  main: { flex: 3, minWidth: 0 },
  side: { flex: 2, minWidth: 0 },
  padded: { padding: spacing.lg },
});
