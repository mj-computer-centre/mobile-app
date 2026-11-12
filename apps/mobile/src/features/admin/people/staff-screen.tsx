import { zodResolver } from '@hookform/resolvers/zod';
import { staffInviteSchema, toAppError, type StaffInviteValues } from '@mcc/shared';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { useStaffRole, useUserId } from '@/features/auth';
import { confirmAction, showMessage } from '@/lib/platform/confirm';
import {
  AppText,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  FormTextField,
  IconButton,
  ListRow,
  LoadingState,
  Screen,
  spacing,
} from '@/ui';

import { AdminSection } from '../shared/admin-section';
import { useStaffActions, useStaffList } from './hooks';

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
  if (staff.isPending) return <LoadingState />;
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
      <AdminSection title="Staff" padded={false}>
        {staff.data.map((member) => {
          const name = member.full_name || member.email || 'Staff member';
          return (
            <ListRow
              key={member.user_id ?? name}
              title={member.user_id === myId ? `${name} (you)` : name}
              subtitle={member.email ?? undefined}
              trailing={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Badge
                    label={member.role === 'owner' ? 'Owner' : 'Admin'}
                    tone={member.role === 'owner' ? 'primary' : 'neutral'}
                  />
                  {member.user_id && member.user_id !== myId ? (
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
      </AdminSection>

      <AdminSection
        title="Add a staff member"
        description="They must sign in to the app once with this Gmail address first.">
        <View style={{ gap: spacing.lg }}>
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
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button
                  label="Admin"
                  compact
                  variant={field.value === 'admin' ? 'primary' : 'secondary'}
                  onPress={() => field.onChange('admin')}
                />
                <Button
                  label="Owner"
                  compact
                  variant={field.value === 'owner' ? 'primary' : 'secondary'}
                  onPress={() => field.onChange('owner')}
                />
              </View>
            )}
          />
          <AppText variant="caption" color="textMuted">
            Admins manage courses, units, lessons, banners and contact details. Owners can also
            manage staff.
          </AppText>
          {add.isError ? <AppText color="danger">{toAppError(add.error).message}</AppText> : null}
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
