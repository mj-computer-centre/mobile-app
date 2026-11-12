import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

/** A file the person chose, in the same shape on every platform. */
export interface PickedFile {
  uri: string;
  name: string;
  sizeBytes: number | null;
  mimeType: string;
  /** Only on the web: the browser's File object. */
  webFile?: Blob;
}

export async function pickPdf(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: false,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    name: asset.name,
    sizeBytes: asset.size ?? null,
    mimeType: asset.mimeType ?? 'application/pdf',
    ...(asset.file ? { webFile: asset.file } : {}),
  };
}

/** Pick a picture, cropped to 16:9 for course covers and banners. */
export async function pickImage(): Promise<PickedFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    name: asset.fileName ?? `image-${Date.now()}.jpg`,
    sizeBytes: asset.fileSize ?? null,
    mimeType: asset.mimeType ?? 'image/jpeg',
    ...(asset.file ? { webFile: asset.file } : {}),
  };
}

/** The file's contents, ready for Supabase Storage. */
export async function readPickedFile(file: PickedFile): Promise<ArrayBuffer | Blob> {
  if (file.webFile) return file.webFile;
  return new File(file.uri).arrayBuffer();
}

export function fileExtension(file: PickedFile): string {
  const fromName = /\.([a-z0-9]{2,5})$/i.exec(file.name)?.[1];
  if (fromName) return fromName.toLowerCase();
  if (file.mimeType === 'image/png') return 'png';
  if (file.mimeType === 'image/webp') return 'webp';
  if (file.mimeType === 'application/pdf') return 'pdf';
  return 'jpg';
}
