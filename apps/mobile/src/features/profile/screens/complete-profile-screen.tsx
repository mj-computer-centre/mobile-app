import { AppText, ErrorState, LoadingState, Screen } from '@/ui';

import { ProfileForm } from '../components/profile-form';
import { useMyProfile } from '../hooks';

/** Shown once after the first Google sign-in; the access gate opens the app when it is saved. */
export function CompleteProfileScreen() {
  const profile = useMyProfile();

  if (profile.isPending) return <LoadingState />;
  if (profile.isError)
    return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;

  return (
    <Screen>
      <AppText variant="title">Welcome!</AppText>
      <AppText color="textMuted">Tell us a little about you. It takes a few seconds.</AppText>
      <ProfileForm
        submitLabel="Start learning"
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
