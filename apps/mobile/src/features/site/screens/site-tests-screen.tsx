import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PageTitle } from '@/lib/page-title';
import { routes } from '@/lib/routes';
import {
  AppText,
  Button,
  ErrorState,
  IconChip,
  ListGroup,
  SectionHeader,
  SkeletonRows,
  spacing,
  useLayout,
  type IconName,
} from '@/ui';

import { Section, SiteBody } from '../components/site-page';
import { useUpcomingTests } from '../hooks';
import { PublicTestRow } from './landing-screen';

const RULES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'calendar-clock-outline',
    title: 'Each test has a time window',
    text: 'The centre sets when a test opens and closes. You can start any time in between.',
  },
  {
    icon: 'timer-outline',
    title: 'The clock starts when you do',
    text: 'You get the minutes the test allows, or until the test closes if that comes first. If the app closes, come back and carry on.',
  },
  {
    icon: 'check-decagram-outline',
    title: 'Your score comes at once',
    text: 'After the test closes for everyone you can also see your rank and the right answer to every question.',
  },
  {
    icon: 'history',
    title: 'Missed it?',
    text: 'The centre can open a test again for students who missed it. Your attempt is then marked as taken late.',
  },
];

/** The Tests page of the public website: how tests work, and what is coming up. */
export function SiteTestsScreen() {
  const { isWide } = useLayout();
  const tests = useUpcomingTests();

  return (
    <SiteBody>
      <PageTitle
        title="Tests"
        description="How timed tests work at Mishra Computer Centre, and the tests that are coming up."
      />
      <Section>
        <View style={styles.heading}>
          <AppText variant="display" accessibilityRole="header">
            Tests
          </AppText>
          <AppText color="textMuted" style={styles.lead}>
            Timed tests set by Mishra Computer Centre: questions with one right answer each, taken
            in the app or on this website.
          </AppText>
        </View>

        <View style={styles.rules}>
          {RULES.map((rule) => (
            <View key={rule.title} style={[styles.rule, isWide && styles.ruleWide]}>
              <IconChip name={rule.icon} size={44} />
              <View style={styles.ruleText}>
                <AppText variant="subheading">{rule.title}</AppText>
                <AppText color="textMuted">{rule.text}</AppText>
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Section background="surface">
        <SectionHeader title="Coming up" description="Tests that are open now or still to come." />
        {tests.isPending ? (
          <SkeletonRows />
        ) : tests.isError ? (
          <ErrorState error={tests.error} onRetry={() => void tests.refetch()} />
        ) : tests.data.length === 0 ? (
          <AppText color="textMuted">
            No test is planned right now. The centre announces new tests here.
          </AppText>
        ) : (
          <ListGroup>
            {tests.data.map((test) => (
              <PublicTestRow key={test.id} test={test} />
            ))}
          </ListGroup>
        )}
        <View style={styles.action}>
          <Button
            label="Sign in to take a test"
            variant="accent"
            iconAfter="arrow-right"
            onPress={() => router.push(routes.signIn)}
          />
        </View>
      </Section>
    </SiteBody>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
  lead: { maxWidth: 620 },
  rules: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  rule: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', width: '100%' },
  ruleWide: { width: '47%' },
  ruleText: { flex: 1, gap: spacing.xs / 2 },
  action: { alignSelf: 'flex-start' },
});
