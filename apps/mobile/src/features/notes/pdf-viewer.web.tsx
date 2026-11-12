import { StyleSheet, View } from 'react-native';

import type { PdfViewerProps } from './pdf-viewer';

/** Web: the browser's built-in PDF viewer. */
export function PdfViewer({ url, title }: PdfViewerProps) {
  return (
    <View style={styles.root}>
      <iframe title={title} src={url} width="100%" height="100%" style={{ border: 0, flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 480 },
});
