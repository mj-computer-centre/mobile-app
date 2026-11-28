// Keeps the centre's pictures (course covers and home banners) on Cloudinary. Every request is
// signed with the API secret, which exists only in the functions' secrets: the app never sees it.
// Plain TypeScript using web APIs only, so the unit tests in packages/shared can run it
// (packages/shared/src/images/cloudinary.test.ts).
import { IMAGE_TYPES, type ImageType } from './image-type.ts';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  /** This app's own folder in the account. Nothing outside it is ever removed. */
  folder: string;
}

/** Used when CLOUDINARY_FOLDER is not set, or is not a plain folder path. */
export const DEFAULT_FOLDER = 'mishra-computer-centre';

/** What the picture is for; each kind has its own folder inside the app's folder. */
export const IMAGE_FOLDERS = { course: 'courses', banner: 'banners' } as const;

export type ImageKind = keyof typeof IMAGE_FOLDERS;

export function isImageKind(value: unknown): value is ImageKind {
  return typeof value === 'string' && Object.hasOwn(IMAGE_FOLDERS, value);
}

/** Same limit as the app checks before sending (LIMITS.imageBytes in packages/shared). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** How many pictures one `remove-images` request may name (the same number in packages/shared). */
export const MAX_IMAGES_PER_REMOVAL = 10;

const UPLOAD_TIMEOUT_MS = 30_000;
const REMOVE_TIMEOUT_MS = 15_000;

const SAFE_PATH = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/;

/**
 * The account's settings, or null when one is missing. `read` returns a secret by name
 * (`Deno.env.get` in a function), which keeps this file free of anything Deno-only.
 */
export function cloudinaryConfig(
  read: (name: string) => string | undefined,
): CloudinaryConfig | null {
  const cloudName = read('CLOUDINARY_CLOUD_NAME')?.trim();
  const apiKey = read('CLOUDINARY_API_KEY')?.trim();
  const apiSecret = read('CLOUDINARY_API_SECRET')?.trim();
  if (!cloudName || !apiKey || !apiSecret) return null;
  const folder = (read('CLOUDINARY_FOLDER') ?? '').trim().replace(/^\/+|\/+$/g, '');
  return { cloudName, apiKey, apiSecret, folder: SAFE_PATH.test(folder) ? folder : DEFAULT_FOLDER };
}

/**
 * Cloudinary's request signature: the parameters sorted by name and joined like a query string,
 * followed by the API secret, hashed with SHA-1. `file`, `api_key` and `signature` itself are
 * never part of it; every other parameter sent must be.
 */
export async function signRequest(
  params: Record<string, string>,
  apiSecret: string,
): Promise<string> {
  const toSign = Object.keys(params)
    .sort()
    .map((name) => `${name}=${params[name]}`)
    .join('&');
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(toSign + apiSecret));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function deliveryPrefix(config: CloudinaryConfig): string {
  return `https://res.cloudinary.com/${config.cloudName}/image/upload/`;
}

/**
 * The picture's name on Cloudinary ("public id") when the URL is one of this app's pictures:
 * on our account and inside our folder. Anything else gives null, so a request can never
 * remove a picture that belongs to something else in the same account.
 *
 *   https://res.cloudinary.com/<cloud>/image/upload/v1732790000/<folder>/courses/<name>.jpg
 */
export function ownPublicId(url: string, config: CloudinaryConfig): string | null {
  const prefix = deliveryPrefix(config);
  if (!url.startsWith(prefix)) return null;
  const publicId = url
    .slice(prefix.length)
    .replace(/^v\d+\//, '')
    .replace(/\.[A-Za-z0-9]+$/, '');
  return SAFE_PATH.test(publicId) && publicId.startsWith(`${config.folder}/`) ? publicId : null;
}

interface UploadReply {
  secure_url?: string;
  error?: { message?: string };
}

/**
 * Stores a picture and returns its https URL, or null when Cloudinary refuses it. The caller
 * has already checked the size and worked out `type` from the bytes.
 */
export async function storeImage(
  config: CloudinaryConfig,
  kind: ImageKind,
  bytes: Uint8Array<ArrayBuffer>,
  type: ImageType,
  now: number = Date.now(),
): Promise<string | null> {
  const params = {
    folder: `${config.folder}/${IMAGE_FOLDERS[kind]}`,
    timestamp: String(Math.floor(now / 1000)),
    // Kept at most this large: a phone photo is several times bigger than any screen shows it.
    transformation: 'c_limit,h_2000,w_2000',
  };
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: IMAGE_TYPES[type].mime }));
  for (const [name, value] of Object.entries(params)) form.append(name, value);
  form.append('api_key', config.apiKey);
  form.append('signature', await signRequest(params, config.apiSecret));

  let status = 0;
  let data: UploadReply | null = null;
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      { method: 'POST', body: form, signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS) },
    );
    status = response.status;
    data = (await response.json().catch(() => null)) as UploadReply | null;
  } catch (error) {
    console.error('cloudinary: upload did not finish', error instanceof Error ? error.name : '');
    return null;
  }

  const url = data?.secure_url;
  // The app shows only URLs of this shape, and removing a picture later needs its name from the
  // URL: a URL that does not fit is treated as a failed upload rather than saved.
  if (status === 200 && url && ownPublicId(url, config)) return url;
  console.error('cloudinary: upload failed', status, data?.error?.message ?? 'unexpected reply');
  return null;
}

/**
 * Removes a picture for good, also from Cloudinary's CDN. True when it is gone (including when
 * it was not there any more).
 */
export async function removeImage(
  config: CloudinaryConfig,
  publicId: string,
  now: number = Date.now(),
): Promise<boolean> {
  const params = {
    invalidate: 'true',
    public_id: publicId,
    timestamp: String(Math.floor(now / 1000)),
  };
  const body = new URLSearchParams({
    ...params,
    api_key: config.apiKey,
    signature: await signRequest(params, config.apiSecret),
  });
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
      { method: 'POST', body, signal: AbortSignal.timeout(REMOVE_TIMEOUT_MS) },
    );
    const data = (await response.json().catch(() => null)) as { result?: string } | null;
    if (response.ok && (data?.result === 'ok' || data?.result === 'not found')) return true;
    console.error('cloudinary: remove failed', response.status, data?.result ?? '');
    return false;
  } catch (error) {
    console.error('cloudinary: remove did not finish', error instanceof Error ? error.name : '');
    return false;
  }
}
