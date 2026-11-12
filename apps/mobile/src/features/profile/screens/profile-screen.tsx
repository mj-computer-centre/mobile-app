import { formatIndianMobile, toAppError } from '@mcc/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Share, View } from 'react-native';

import { useSignOut } from '@/features/auth';
import { confirmAction, showMessage } from '@/lib/platform/confirm';
import { routes } from '@/lib/routes';
import { AppText, Button, Card, ErrorState, ListRow, LoadingState, Screen, spacing } from '@/ui';

import { ProfileForm } from '../components/profile-form';
import { useDeleteAccount, useMyProfile } from '../hooks';

export function ProfileScreen() {
  const profile = useMyProfile();
  const signOut = useSignOut();
  const deleteAccount = useDeleteAccount();
  const [editing, setEditing] = useState(false);

  if (profile.isPending) return <LoadingState />;
  if (profile.isError)
    return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;
  const me = profile.data;

  const confirmDelete = async () => {
    const ok = await confirmAction({
      title: 'Delete your account?',
      message: 'Your name, phone number and email are removed permanently. This cannot be undone.',
      confirmLabel: 'Delete account',
      destructive: true,
    });
    if (!ok) return;
    deleteAccount.mutate(undefined, {
      onError: (error) => showMessage('Could not delete the account', toAppError(error).message),
    });
  };

  return (
    <Screen edges={[]}>
      <AppText variant="title">{me.full_name || 'Your profile'}</AppText>

      {editing ? (
        <Card>
          <ProfileForm
            submitLabel="Save"
            onSaved={() => setEditing(false)}
            initialValues={{
              fullName: me.full_name ?? '',
              phone: me.phone ?? '',
              city: me.city ?? '',
              interestedCourseId: me.interested_course_id ?? '',
            }}
          />
        </Card>
      ) : (
        <Card padded={false}>
          <ListRow title="Email" subtitle={me.email ?? '—'} />
          <ListRow
            title="Mobile"
            subtitle={me.phone ? formatIndianMobile(me.phone) : 'Not added'}
          />
          <ListRow title="Village or town" subtitle={me.city ?? 'Not added'} />
          <View style={{ padding: spacing.lg }}>
            <Button
              label="Edit details"
              icon="pencil"
              variant="secondary"
              onPress={() => setEditing(true)}
            />
          </View>
        </Card>
      )}

      <Card padded={false}>
        <ListRow
          title="Share the app"
          subtitle="Tell a friend about free computer courses"
          onPress={() =>
            void Share.share({
              message: 'Learn computer courses free with Mishra Computer Centre.',
            })
          }
          navigates
        />
        <ListRow title="Privacy policy" onPress={() => router.push(routes.privacy)} navigates />
      </Card>

      <Button
        label="Sign out"
        icon="logout"
        variant="secondary"
        loading={signOut.isPending}
        onPress={() => signOut.mutate()}
      />
      <Button
        label="Delete my account"
        icon="delete-outline"
        variant="danger"
        loading={deleteAccount.isPending}
        onPress={() => void confirmDelete()}
      />
    </Screen>
  );
}
