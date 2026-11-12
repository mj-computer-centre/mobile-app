import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Native: writes the file to the cache and opens the share sheet (WhatsApp, Drive, Gmail…). */
export async function saveTextFile(
  fileName: string,
  contents: string,
  mimeType: string,
): Promise<void> {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(contents);
  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: fileName });
}
