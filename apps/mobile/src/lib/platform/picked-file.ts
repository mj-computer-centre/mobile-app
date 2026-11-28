import { decodeImageDataUrl } from '@mcc/shared';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

/** A file the person chose, in the same shape on every platform. */
export interface PickedFile {
  /** Where it is. For a picture, also what an image can show before it is uploaded. */
  uri: string;
  name: string;
  sizeBytes: number | null;
  mimeType: string;
  /** Only on the web: the browser's File object. */
  webFile?: Blob;
  /** Only for a picture that never was a file (one drawn by AI): its contents. */
  bytes?: ArrayBuffer;
}

/** A picture held as a data URL (one drawn by AI), in the shape of a picked file. */
export function pickedFileFromDataUrl(dataUrl: string, baseName: string): PickedFile | null {
  const decoded = decodeImageDataUrl(dataUrl);
  if (!decoded) return null;
  return {
    uri: dataUrl,
    name: `${baseName}.${decoded.extension}`,
    sizeBytes: decoded.bytes.byteLength,
    mimeType: decoded.mimeType,
    bytes: decoded.bytes.buffer,
  };
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

/** The file's contents, ready to upload. */
export async function readPickedFile(file: PickedFile): Promise<ArrayBuffer | Blob> {
  if (file.webFile) return file.webFile;
  if (file.bytes) return file.bytes;
  return new File(file.uri).arrayBuffer();
}
