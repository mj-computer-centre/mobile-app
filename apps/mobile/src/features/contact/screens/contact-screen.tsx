import { formatIndianMobile } from '@mcc/shared';
import { Linking } from 'react-native';

import {
  AppText,
  Card,
  ErrorState,
  Icon,
  ListRow,
  LoadingState,
  Screen,
  type IconName,
} from '@/ui';

import { useSettings } from '../api';

interface ContactAction {
  key: string;
  icon: IconName;
  title: string;
  subtitle: string;
  url: string;
}

// Contacting the centre deliberately opens the phone dialer, WhatsApp or Maps; these are the
// only links in the app that leave it, and only when the student taps them.
export function ContactScreen() {
  const settings = useSettings();

  if (settings.isPending) return <LoadingState />;
  if (settings.isError)
    return <ErrorState error={settings.error} onRetry={() => void settings.refetch()} />;
  const s = settings.data;

  const actions: ContactAction[] = [
    s.phone && {
      key: 'call',
      icon: 'phone',
      title: 'Call',
      subtitle: formatIndianMobile(s.phone),
      url: `tel:+91${s.phone}`,
    },
    s.whatsapp && {
      key: 'whatsapp',
      icon: 'whatsapp',
      title: 'WhatsApp',
      subtitle: formatIndianMobile(s.whatsapp),
      url: `https://wa.me/91${s.whatsapp}`,
    },
    s.email && {
      key: 'email',
      icon: 'email-outline',
      title: 'Email',
      subtitle: s.email,
      url: `mailto:${s.email}`,
    },
    s.map_url && {
      key: 'map',
      icon: 'map-marker-outline',
      title: 'Directions',
      subtitle: s.address ?? 'Open in Maps',
      url: s.map_url,
    },
    s.youtube_url && {
      key: 'youtube',
      icon: 'youtube',
      title: 'YouTube channel',
      subtitle: 'Watch on YouTube',
      url: s.youtube_url,
    },
    s.instagram_url && {
      key: 'instagram',
      icon: 'instagram',
      title: 'Instagram',
      subtitle: 'Follow us',
      url: s.instagram_url,
    },
    s.facebook_url && {
      key: 'facebook',
      icon: 'facebook',
      title: 'Facebook',
      subtitle: 'Follow us',
      url: s.facebook_url,
    },
  ].filter((action): action is ContactAction => Boolean(action));

  return (
    <Screen edges={[]} refreshing={settings.isRefetching} onRefresh={() => void settings.refetch()}>
      <AppText variant="title">{s.centre_name}</AppText>
      {s.address && !s.map_url ? <AppText color="textMuted">{s.address}</AppText> : null}
      {s.timings ? (
        <Card>
          <AppText variant="label">Timings</AppText>
          <AppText color="textMuted">{s.timings}</AppText>
        </Card>
      ) : null}
      {actions.length > 0 ? (
        <Card padded={false}>
          {actions.map((action) => (
            <ListRow
              key={action.key}
              title={action.title}
              subtitle={action.subtitle}
              leading={<Icon name={action.icon} color="primary" />}
              onPress={() => void Linking.openURL(action.url)}
              navigates
            />
          ))}
        </Card>
      ) : (
        <AppText color="textMuted">Contact details will appear here soon.</AppText>
      )}
    </Screen>
  );
}
