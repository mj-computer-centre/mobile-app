import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Shown instead of the app when EXPO_PUBLIC_* settings are missing or invalid (a developer
// mistake, never something a student should see in a store build). Plain components only: the
// providers the design system relies on are not mounted yet.
export function SetupRequiredScreen({ problems }: { problems: string[] }) {
  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>The app is not configured yet</Text>
        <Text style={styles.body}>
          Copy apps/mobile/.env.example to apps/mobile/.env.local, fill in the values, and restart
          Expo.
        </Text>
        {problems.map((problem) => (
          <Text key={problem} style={styles.body}>
            • {problem}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F2F4F7' },
  card: { gap: 12, padding: 20, borderRadius: 16, backgroundColor: '#FFFFFF' },
  title: { fontSize: 20, fontWeight: '700', color: '#0E1116' },
  body: { fontSize: 15, lineHeight: 22, color: '#3A424E' },
});
