import { formatIndianMobile } from '@mcc/shared';
import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSettings } from '@/features/contact';
import { PageTitle } from '@/lib/page-title';
import { routes } from '@/lib/routes';
import { AppText, spacing } from '@/ui';

import { LegalPage } from './legal-page';

// The policy describes what the app and the website actually do. When a feature changes what
// is collected, stored or shown to others, change this text and the date in the same change.
// Google Play needs this page's public address: https://<website>/privacy. The owner should
// read it before launch (backlog OPS-06).
const LAST_UPDATED = '28 November 2026';

const SECTIONS: { heading: string; intro?: string; points?: string[]; closing?: string }[] = [
  {
    heading: 'What we collect',
    points: [
      'From Google, when you sign in: your name, your email address and the address of your Google profile picture. We use your name and email. We do not show or use the picture.',
      'From the form you fill in after signing in: your mobile number, your village or town if you give it, and the course you are interested in if you choose one.',
      'From the tests you take: the answers you chose, your score, when you started and finished, and whether you took the test late.',
    ],
    closing:
      'That is all. The app does not use your location, contacts, camera or microphone, and it shows no advertisements of its own. Only the centre’s staff choose pictures from their own phones, to add course covers and banners.',
  },
  {
    heading: 'Why we collect it',
    points: [
      'To let you sign in and open the courses and tests.',
      'So the centre can contact you about courses, admissions and your results.',
      'To show you your own scores, and to show the centre’s teachers how their students did.',
    ],
    closing: 'We do not sell your information, and we do not share it with advertisers.',
  },
  {
    heading: 'Who can see it',
    points: [
      'You see your own details and your own results.',
      'The centre’s staff (the owner, and the staff the owner appoints) can see each student’s name, email address, mobile number, village or town, course interest and test results.',
      'Other students cannot see your details. After a test closes you see your own rank as a number; nobody’s name is shown.',
    ],
  },
  {
    heading: 'Who helps us run the app',
    points: [
      'Supabase keeps the database, the sign-in service and the PDF notes on its cloud servers.',
      'Cloudinary keeps the pictures of the courses and the banners on the home page, and sends them to your phone or browser. Like any service that sends a picture, it sees your IP address; we give it nothing else about you.',
      'Google provides sign-in. Course videos play in YouTube’s player inside the app; YouTube, which is part of Google, may collect information about what you watch and may show its own advertisements, under Google’s privacy policy.',
      'Cloudflare draws some of the course pictures when the centre’s staff ask for one. It is sent only a description of the picture, never anything about a student.',
      'The company that hosts this website keeps ordinary visitor logs, such as IP addresses, to keep the site safe.',
    ],
    closing:
      'Information travels between your phone and these services over an encrypted connection.',
  },
  {
    heading: 'What is kept on your phone or browser',
    points: [
      'Your sign-in, so you do not have to sign in every time.',
      'In the Android app, the list of courses, their pictures and the PDF notes you have opened, so they open faster and work without internet.',
    ],
    closing: 'We do not use advertising or tracking cookies.',
  },
  {
    heading: 'How long we keep it',
    intro:
      'For as long as you have an account. When you delete your account, your details and your test results are deleted from our database at once and cannot be brought back. Copies in routine backups, where there are any, go when those backups expire.',
  },
  {
    heading: 'Children',
    intro:
      'The courses are meant for students aged 13 and above. A younger student should use the app with a parent or guardian. If you believe a child under 13 has signed up without a parent knowing, tell the centre and we will delete the account.',
  },
  {
    heading: 'Changes to this policy',
    intro:
      'If the policy changes, the new version is published on this page with a new date at the top.',
  },
];

/** A link inside a sentence, in the page's link colour. */
function InlineLink({ href, children }: { href: Href; children: ReactNode }) {
  return (
    <Link href={href}>
      <AppText color="primary">{children}</AppText>
    </Link>
  );
}

export function PrivacyScreen() {
  const settings = useSettings();
  const centre = settings.data;

  return (
    <LegalPage>
      <PageTitle
        title="Privacy policy"
        description="What Mishra Computer Centre keeps about the students who use its app and website, why, and how to have it deleted."
      />
      <View style={styles.heading}>
        <AppText variant="display" accessibilityRole="header">
          Privacy policy
        </AppText>
        <AppText variant="caption" color="textMuted">
          Last updated {LAST_UPDATED}
        </AppText>
      </View>
      <AppText>
        This policy covers the Mishra Computer Centre app for Android and this website. It explains
        what we keep about you, why we keep it, and how you can have it deleted.
      </AppText>

      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          Who we are
        </AppText>
        <AppText>
          The app and the website belong to Mishra Computer Centre, Makhdumpur, Jehanabad, Bihar,
          India. The centre is responsible for the information described on this page.
        </AppText>
      </View>

      {SECTIONS.map((section) => (
        <View key={section.heading} style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {section.heading}
          </AppText>
          {section.intro ? <AppText>{section.intro}</AppText> : null}
          {section.points?.map((point) => (
            <View key={point} style={styles.point}>
              <AppText color="textMuted">•</AppText>
              <AppText style={styles.pointText}>{point}</AppText>
            </View>
          ))}
          {section.closing ? <AppText>{section.closing}</AppText> : null}
        </View>
      ))}

      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          Your choices
        </AppText>
        <View style={styles.point}>
          <AppText color="textMuted">•</AppText>
          <AppText style={styles.pointText}>
            See or correct your details: open Profile and press “Edit details”.
          </AppText>
        </View>
        <View style={styles.point}>
          <AppText color="textMuted">•</AppText>
          <AppText style={styles.pointText}>
            Delete your account and everything kept with it: open Profile and press “Delete my
            account”. The steps are on the{' '}
            <InlineLink href={routes.deleteAccountInfo}>Delete your account</InlineLink> page.
          </AppText>
        </View>
        <View style={styles.point}>
          <AppText color="textMuted">•</AppText>
          <AppText style={styles.pointText}>
            Ask a question, or ask the centre to delete your information for you: use the details
            below.
          </AppText>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          Contact
        </AppText>
        <AppText>
          {centre?.centre_name ?? 'Mishra Computer Centre'}
          {centre?.address ? `, ${centre.address}` : ', Makhdumpur, Jehanabad, Bihar, India'}
        </AppText>
        {centre?.phone ? <AppText>Phone: {formatIndianMobile(centre.phone)}</AppText> : null}
        {centre?.email ? <AppText>Email: {centre.email}</AppText> : null}
        <AppText>
          Every way to reach the centre is on the{' '}
          <InlineLink href={routes.contact}>Contact</InlineLink> page.
        </AppText>
      </View>
    </LegalPage>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
  section: { gap: spacing.sm },
  point: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  pointText: { flex: 1 },
});
