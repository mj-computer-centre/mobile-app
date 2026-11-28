import { formatIndianMobile, toAppError } from '@mcc/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';

import { useSignOut, useStaffRole } from '@/features/auth';
import { useCourseOptions } from '@/features/catalog';
import { useSettings } from '@/features/contact';
import { confirmAction, showMessage } from '@/lib/platform/confirm';
import { routes } from '@/lib/routes';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  ErrorState,
  IconChip,
  ListGroup,
  ListRow,
  Screen,
  Sheet,
  SkeletonRows,
  spacing,
} from '@/ui';

import { ProfileForm } from '../components/profile-form';
import { useDeleteAccount, useMyProfile } from '../hooks';

export function ProfileScreen() {
  const profile = useMyProfile();
  const role = useStaffRole();
  const courses = useCourseOptions();
  const settings = useSettings();
  const signOut = useSignOut();
  const deleteAccount = useDeleteAccount();
  const [editing, setEditing] = useState(false);

  if (profile.isPending) {
    return (
      <Screen edges={[]}>
        <SkeletonRows count={4} />
      </Screen>
    );
  }
  if (profile.isError)
    return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;
  const me = profile.data;
  const name = me.full_name || me.email || 'Your profile';
  const interest = courses.data?.find((course) => course.id === me.interested_course_id)?.title;
  const playStoreUrl = settings.data?.play_store_url;

  const confirmDelete = async () => {
    const ok = await confirmAction({
      title: 'Delete your account?',
      message:
        'Your name, mobile number, email and your test results are removed permanently. This cannot be undone.',
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
      <View style={styles.header}>
        <Avatar name={name} size={64} />
        <View style={styles.headerText}>
          <AppText variant="title" accessibilityRole="header" numberOfLines={2}>
            {name}
          </AppText>
          {me.email && me.full_name ? (
            <AppText color="textMuted" numberOfLines={1}>
              {me.email}
            </AppText>
          ) : null}
          {role ? <Badge label={role === 'owner' ? 'Owner' : 'Admin'} tone="primary" /> : null}
        </View>
      </View>

      <View style={styles.section}>
        <ListGroup>
          <ListRow
            title="Mobile"
            subtitle={me.phone ? formatIndianMobile(me.phone) : 'Not added'}
            leading={<IconChip name="phone-outline" tone="neutral" />}
          />
          <ListRow
            title="Village or town"
            subtitle={me.city ?? 'Not added'}
            leading={<IconChip name="map-marker-outline" tone="neutral" />}
          />
          <ListRow
            title="Course you are interested in"
            subtitle={interest ?? 'Not chosen'}
            leading={<IconChip name="school-outline" tone="neutral" />}
          />
        </ListGroup>
        <Button
          label="Edit details"
          icon="pencil"
          variant="secondary"
          onPress={() => setEditing(true)}
        />
      </View>

      <ListGroup>
        <ListRow
          title="Contact the centre"
          subtitle="Call, WhatsApp, directions and timings"
          leading={<IconChip name="card-account-phone-outline" />}
          onPress={() => router.push(routes.contact)}
          navigates
        />
        <ListRow
          title="Share the app"
          subtitle="Tell a friend about the centre’s courses"
          leading={<IconChip name="share-variant-outline" />}
          onPress={() =>
            void Share.share({
              message: `Learn computer courses with Mishra Computer Centre.${playStoreUrl ? ` ${playStoreUrl}` : ''}`,
            })
          }
          navigates
        />
        <ListRow
          title="Privacy policy"
          subtitle="What the centre keeps about you, and why"
          leading={<IconChip name="shield-lock-outline" />}
          onPress={() => router.push(routes.privacy)}
          navigates
        />
      </ListGroup>

      <View style={styles.section}>
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
      </View>

      <Sheet visible={editing} onClose={() => setEditing(false)} title="Your details" tall>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
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
        </ScrollView>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  headerText: { flex: 1, gap: spacing.xs, minWidth: 0 },
  section: { gap: spacing.md },
  form: { paddingBottom: spacing.xl },
});
