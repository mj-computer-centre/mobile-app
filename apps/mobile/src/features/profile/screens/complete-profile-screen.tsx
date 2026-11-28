import { View } from 'react-native';

import { AppText, BrandMark, ErrorState, LoadingState, Screen, spacing } from '@/ui';

import { ProfileForm } from '../components/profile-form';
import { useMyProfile } from '../hooks';

/** Shown once after the first Google sign-in; the access gate opens the app when it is saved. */
export function CompleteProfileScreen() {
  const profile = useMyProfile();

  if (profile.isPending) return <LoadingState />;
  if (profile.isError)
    return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;

  const firstName = profile.data.full_name?.split(' ')[0];

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        <BrandMark size={48} />
        <View style={{ gap: spacing.xs }}>
          <AppText variant="display" accessibilityRole="header">
            {firstName ? `Welcome, ${firstName}` : 'Welcome'}
          </AppText>
          <AppText color="textMuted">
            Tell the centre a little about you. It takes a few seconds, and you only do it once.
          </AppText>
        </View>
      </View>
      <ProfileForm
        submitLabel="Start learning"
        emphasis="accent"
        initialValues={{
          fullName: profile.data.full_name ?? '',
          phone: profile.data.phone ?? '',
          city: profile.data.city ?? '',
          interestedCourseId: profile.data.interested_course_id ?? '',
        }}
      />
    </Screen>
  );
}
