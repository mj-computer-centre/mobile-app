import { zodResolver } from '@hookform/resolvers/zod';
import { staffInviteSchema, toAppError, type StaffInviteValues } from '@mcc/shared';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { useStaffRole, useUserId } from '@/features/auth';
import { confirmAction, showMessage } from '@/lib/platform/confirm';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  FormTextField,
  IconButton,
  ListGroup,
  ListRow,
  Screen,
  SegmentedControl,
  SkeletonRows,
  spacing,
  type Segment,
} from '@/ui';

import { AdminSection } from '../shared/admin-section';
import { ErrorNotice } from '../shared/error-notice';
import { useStaffActions, useStaffList } from './hooks';

const ROLES: readonly Segment<StaffInviteValues['role']>[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

/** Owner only: who can manage content. The database enforces the same rule. */
export function StaffScreen() {
  const role = useStaffRole();
  const myId = useUserId();
  const staff = useStaffList();
  const { add, remove } = useStaffActions();
  const { control, handleSubmit, reset } = useForm<StaffInviteValues>({
    resolver: zodResolver(staffInviteSchema),
    defaultValues: { email: '', role: 'admin' },
  });

  if (role !== 'owner')
    return <EmptyState icon="lock-outline" title="Only the owner can manage staff" />;
  if (staff.isPending) {
    return (
      <Screen edges={[]}>
        <SkeletonRows />
      </Screen>
    );
  }
  if (staff.isError) return <ErrorState error={staff.error} onRetry={() => void staff.refetch()} />;

  const confirmRemove = async (userId: string, name: string) => {
    const ok = await confirmAction({
      title: `Remove ${name}?`,
      message: 'They will no longer be able to manage courses. Their student account stays.',
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (ok)
      remove.mutate(userId, {
        onError: (e) => showMessage('Could not remove', toAppError(e).message),
      });
  };

  return (
    <Screen edges={[]}>
      <AdminSection title="Who can manage the app" bare>
        <ListGroup>
          {staff.data.map((member) => {
            const name = member.full_name || member.email || 'Staff member';
            const removable = Boolean(member.user_id) && member.user_id !== myId;
            return (
              <ListRow
                key={member.user_id ?? name}
                title={member.user_id === myId ? `${name} (you)` : name}
                subtitle={member.email ?? undefined}
                leading={<Avatar name={name} />}
                trailing={
                  <View style={[styles.trailing, !removable && styles.badgeOnly]}>
                    {/* Wrapped: a badge alone would sit at the top of the row, not its middle. */}
                    <View>
                      <Badge
                        label={member.role === 'owner' ? 'Owner' : 'Admin'}
                        tone={member.role === 'owner' ? 'primary' : 'neutral'}
                      />
                    </View>
                    {removable ? (
                      <IconButton
                        icon="account-remove-outline"
                        label={`Remove ${name}`}
                        color="danger"
                        onPress={() => void confirmRemove(member.user_id as string, name)}
                      />
                    ) : null}
                  </View>
                }
              />
            );
          })}
        </ListGroup>
      </AdminSection>

      <AdminSection
        title="Add a staff member"
        description="They must sign in to the app once with this Gmail address first.">
        <View style={styles.form}>
          <FormTextField
            control={control}
            name="email"
            label="Gmail address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <View style={styles.role}>
                <AppText variant="label">What they can do</AppText>
                <SegmentedControl
                  accessibilityLabel="What they can do"
                  segments={ROLES}
                  value={field.value}
                  onChange={field.onChange}
                />
                <AppText variant="caption" color="textMuted">
                  Admins manage courses, units, lessons, tests, banners and the centre’s details.
                  Owners can also manage staff.
                </AppText>
              </View>
            )}
          />
          <ErrorNotice error={add.error} />
          <Button
            label="Add staff member"
            icon="account-plus-outline"
            loading={add.isPending}
            onPress={handleSubmit((values) =>
              add.mutate(values, { onSuccess: () => reset({ email: '', role: 'admin' }) }),
            )}
          />
        </View>
      </AdminSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  trailing: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // Without a button after it, the badge keeps the same distance from the edge as the row's text.
  badgeOnly: { paddingRight: spacing.sm },
  form: { gap: spacing.lg },
  role: { gap: spacing.sm },
});
