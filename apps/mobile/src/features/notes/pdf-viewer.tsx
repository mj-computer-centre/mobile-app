import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';

import { AppText, ErrorState, spacing, useTheme } from '@/ui';

export interface PdfViewerProps {
  url: string;
  /** Stable cache name, so a PDF opened once can be read again offline. */
  cacheKey: string;
  title: string;
}

/** Native: renders the PDF inside the app; react-native-pdf keeps a cached copy on the phone. */
export function PdfViewer({ url, cacheKey, title }: PdfViewerProps) {
  const { colors } = useTheme();
  const [page, setPage] = useState({ current: 1, total: 0 });
  const [failed, setFailed] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);

  if (failed) {
    return (
      <ErrorState
        error={failed}
        onRetry={() => {
          setFailed(null);
          setAttempt((value) => value + 1);
        }}
      />
    );
  }

  return (
    <View style={styles.root} accessibilityLabel={title}>
      <Pdf
        key={attempt}
        source={{ uri: url, cache: true, cacheFileName: cacheKey }}
        trustAllCerts={false}
        enablePaging={false}
        onLoadComplete={(total) => setPage({ current: 1, total })}
        onPageChanged={(current, total) => setPage({ current, total })}
        onError={(error) => setFailed(error)}
        style={[styles.pdf, { backgroundColor: colors.background }]}
      />
      {page.total > 0 ? (
        <View style={[styles.counter, { backgroundColor: colors.surface }]}>
          <AppText variant="caption">
            Page {page.current} of {page.total}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pdf: { flex: 1, width: '100%' },
  counter: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
});
