import { StyleSheet, View } from 'react-native';

import { AppText, Screen, spacing } from '@/ui';

// Plain-language policy covering what the app actually does. Google Play needs its public URL:
// https://<admin website>/privacy. The owner should read it before launch (backlog OPS-06).
const LAST_UPDATED = '24 October 2026';

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: 'Who we are',
    body: [
      'This app belongs to Mishra Computer Centre, Makhdumpur, Jehanabad, Bihar. It offers free computer courses with video lessons and PDF notes.',
    ],
  },
  {
    heading: 'What we collect',
    body: [
      'When you sign in with Google: your name and email address.',
      'What you type on the “About you” form: your mobile number, village or town, and the course you are interested in.',
      'Nothing else. The app does not use your location, contacts, camera or microphone, and it shows no ads.',
    ],
  },
  {
    heading: 'Why we collect it',
    body: [
      'To give you access to the courses, and so the centre can contact you about courses and admissions.',
      'We never sell your details or share them with advertisers.',
    ],
  },
  {
    heading: 'Where it is stored',
    body: [
      'Your details are stored securely with Supabase, our database provider, and only the centre’s staff can see them.',
      'Course videos are played with YouTube’s player inside the app. YouTube (Google) may collect data about video playback under Google’s privacy policy.',
    ],
  },
  {
    heading: 'Deleting your account',
    body: [
      'Open Profile → Delete my account. Your name, email, phone number and other details are deleted permanently.',
      'You can also ask the centre to delete them using the contact details on the Contact tab.',
    ],
  },
  {
    heading: 'Children',
    body: [
      'The courses are meant for students aged 13 and above. Younger students should use the app with a parent.',
    ],
  },
];

export function PrivacyScreen() {
  return (
    <Screen edges={['bottom']}>
      <AppText variant="title">Privacy policy</AppText>
      <AppText variant="caption" color="textMuted">
        Last updated {LAST_UPDATED}
      </AppText>
      {SECTIONS.map((section) => (
        <View key={section.heading} style={styles.section}>
          <AppText variant="heading">{section.heading}</AppText>
          {section.body.map((paragraph) => (
            <AppText key={paragraph}>{paragraph}</AppText>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
});
