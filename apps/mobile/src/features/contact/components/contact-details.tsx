import { formatIndianMobile } from '@mcc/shared';
import { Linking, StyleSheet, View } from 'react-native';

import { AppText, Button, Icon, ListGroup, ListRow, IconChip, spacing, type IconName } from '@/ui';

import type { CentreSettings } from '../api';

const open = (url: string) => void Linking.openURL(url);

/**
 * Call, WhatsApp and Directions as keys. These are the only things in the app that open
 * another app, and only when the person presses them.
 */
export function ContactActions({ settings }: { settings: CentreSettings }) {
  const { phone, whatsapp, map_url: mapUrl } = settings;
  if (!phone && !whatsapp && !mapUrl) return null;
  return (
    <View style={styles.actions}>
      {phone ? (
        <Button
          label="Call"
          icon="phone"
          accessibilityHint={`Calls ${formatIndianMobile(phone)}`}
          onPress={() => open(`tel:+91${phone}`)}
          style={styles.action}
        />
      ) : null}
      {whatsapp ? (
        <Button
          label="WhatsApp"
          icon="whatsapp"
          variant="secondary"
          accessibilityHint={`Opens a WhatsApp chat with ${formatIndianMobile(whatsapp)}`}
          onPress={() => open(`https://wa.me/91${whatsapp}`)}
          style={styles.action}
        />
      ) : null}
      {mapUrl ? (
        <Button
          label="Directions"
          icon="map-marker-outline"
          variant="secondary"
          accessibilityHint="Opens the centre in Maps"
          onPress={() => open(mapUrl)}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Icon name={icon} size={20} color="textMuted" />
      <View style={styles.factText}>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <AppText selectable>{value}</AppText>
      </View>
    </View>
  );
}

/** Everything the centre has filled in about itself: where, when, and how to reach it. */
export function ContactDetails({ settings }: { settings: CentreSettings }) {
  const s = settings;
  const links: { key: string; icon: IconName; title: string; subtitle: string; url: string }[] = [
    s.email && {
      key: 'email',
      icon: 'email-outline' as const,
      title: 'Email',
      subtitle: s.email,
      url: `mailto:${s.email}`,
    },
    s.youtube_url && {
      key: 'youtube',
      icon: 'youtube' as const,
      title: 'YouTube channel',
      subtitle: 'The centre’s videos on YouTube',
      url: s.youtube_url,
    },
    s.instagram_url && {
      key: 'instagram',
      icon: 'instagram' as const,
      title: 'Instagram',
      subtitle: 'Photos and news from the centre',
      url: s.instagram_url,
    },
    s.facebook_url && {
      key: 'facebook',
      icon: 'facebook' as const,
      title: 'Facebook',
      subtitle: 'The centre’s page',
      url: s.facebook_url,
    },
  ].filter((link): link is NonNullable<typeof link> & object => Boolean(link));

  const hasFacts = Boolean(s.address || s.timings || s.phone || s.whatsapp);
  if (!hasFacts && !s.map_url && links.length === 0) {
    return <AppText color="textMuted">The centre’s contact details will appear here soon.</AppText>;
  }

  return (
    <View style={styles.root}>
      {hasFacts ? (
        <View style={styles.facts}>
          {s.address ? <Fact icon="map-marker-outline" label="Address" value={s.address} /> : null}
          {s.timings ? <Fact icon="clock-outline" label="Open" value={s.timings} /> : null}
          {s.phone ? (
            <Fact icon="phone-outline" label="Phone" value={formatIndianMobile(s.phone)} />
          ) : null}
          {s.whatsapp && s.whatsapp !== s.phone ? (
            <Fact icon="whatsapp" label="WhatsApp" value={formatIndianMobile(s.whatsapp)} />
          ) : null}
        </View>
      ) : null}
      <ContactActions settings={s} />
      {links.length > 0 ? (
        <ListGroup>
          {links.map((link) => (
            <ListRow
              key={link.key}
              title={link.title}
              subtitle={link.subtitle}
              leading={<IconChip name={link.icon} size={40} tone="neutral" />}
              onPress={() => open(link.url)}
              navigates
            />
          ))}
        </ListGroup>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.xl },
  facts: { gap: spacing.lg },
  fact: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  factText: { flex: 1, gap: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  action: { flexGrow: 1, flexBasis: 130 },
});
