import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  cloudinaryConfig,
  DEFAULT_FOLDER,
  IMAGE_FOLDERS,
  isImageKind,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_REMOVAL as FUNCTION_MAX_IMAGES_PER_REMOVAL,
  ownPublicId,
  removeImage,
  signRequest,
  storeImage,
  type CloudinaryConfig,
} from '../../../../supabase/functions/_shared/cloudinary';
import { LIMITS } from '../storage';
import { IMAGE_KINDS, MAX_IMAGES_PER_REMOVAL, uploadImageResponseSchema } from './image-contract';

// The code that talks to Cloudinary lives with the edge functions; it is plain TypeScript, so
// it is tested here. Requests are caught before they leave: nothing below reaches Cloudinary.

const config: CloudinaryConfig = {
  cloudName: 'demo-cloud',
  apiKey: '123456789012345',
  apiSecret: 's3cr3t',
  folder: 'mishra-computer-centre',
};
const NOW = 1_795_855_864_000;
const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const storedUrl =
  'https://res.cloudinary.com/demo-cloud/image/upload/v1795855864/mishra-computer-centre/courses/abc123.jpg';

function answer(body: unknown, status = 200) {
  const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => {
    return new Response(JSON.stringify(body), { status });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('the settings', () => {
  const read = (values: Record<string, string>) => (name: string) => values[name];
  const keys = {
    CLOUDINARY_CLOUD_NAME: ' demo-cloud ',
    CLOUDINARY_API_KEY: '123456789012345',
    CLOUDINARY_API_SECRET: 's3cr3t',
  };

  it('are missing until the cloud name, the key and the secret are all set', () => {
    expect(cloudinaryConfig(read({}))).toBeNull();
    expect(cloudinaryConfig(read({ ...keys, CLOUDINARY_API_SECRET: '' }))).toBeNull();
    expect(cloudinaryConfig(read(keys))).toEqual({ ...config, folder: DEFAULT_FOLDER });
  });

  it('use the folder that is set, without slashes at its ends', () => {
    expect(cloudinaryConfig(read({ ...keys, CLOUDINARY_FOLDER: '/centre/app/' }))?.folder).toBe(
      'centre/app',
    );
  });

  it('fall back to the app’s own folder when the folder is not a plain path', () => {
    for (const folder of ['', '  ', '#create new', '../other', 'a//b', 'a b']) {
      expect(cloudinaryConfig(read({ ...keys, CLOUDINARY_FOLDER: folder }))?.folder).toBe(
        DEFAULT_FOLDER,
      );
    }
  });

  it('agree with the app on kinds and limits', () => {
    expect(Object.keys(IMAGE_FOLDERS)).toEqual([...IMAGE_KINDS]);
    expect(MAX_IMAGE_BYTES).toBe(LIMITS.imageBytes);
    expect(FUNCTION_MAX_IMAGES_PER_REMOVAL).toBe(MAX_IMAGES_PER_REMOVAL);
    expect(isImageKind('course')).toBe(true);
    expect(isImageKind('banner')).toBe(true);
    expect(isImageKind('toString')).toBe(false);
    expect(isImageKind(null)).toBe(false);
  });
});

describe('signing a request', () => {
  it('matches the example in Cloudinary’s documentation', async () => {
    expect(await signRequest({ timestamp: '1315060510', public_id: 'sample_image' }, 'abcd')).toBe(
      'b4ad47fb4e25c7bf5f92a20089f9db59bc302313',
    );
  });
});

describe('telling this app’s pictures from others', () => {
  it('reads the picture’s name from its URL', () => {
    expect(ownPublicId(storedUrl, config)).toBe('mishra-computer-centre/courses/abc123');
    expect(ownPublicId(storedUrl.replace('/v1795855864', ''), config)).toBe(
      'mishra-computer-centre/courses/abc123',
    );
  });

  it('refuses a picture on another account or outside the app’s folder', () => {
    const outside = (url: string) => expect(ownPublicId(url, config)).toBeNull();
    outside(storedUrl.replace('demo-cloud', 'other-cloud'));
    outside('https://res.cloudinary.com/demo-cloud/image/upload/v1/restaurant/dishes/dal.jpg');
    outside('https://res.cloudinary.com/demo-cloud/image/upload/v1/mishra-computer-centre.jpg');
    outside(
      'https://res.cloudinary.com/demo-cloud/image/upload/v1/mishra-computer-centre-2/courses/a.jpg',
    );
    outside(
      'https://res.cloudinary.com/demo-cloud/image/upload/v1/mishra-computer-centre/../restaurant/a.jpg',
    );
    outside('https://example.com/demo-cloud/image/upload/v1/mishra-computer-centre/courses/a.jpg');
    outside('courses/7f3c/1732790000.jpg');
  });

  it('refuses a URL that carries resizing instructions: only the stored form is a name', () => {
    expect(
      ownPublicId(storedUrl.replace('/upload/', '/upload/c_fill,ar_16:9,g_auto/'), config),
    ).toBeNull();
  });
});

describe('storing a picture', () => {
  it('sends a signed upload into the kind’s folder and returns where it lives', async () => {
    const fetchMock = answer({ secure_url: storedUrl });

    expect(await storeImage(config, 'course', jpeg, 'jpeg', NOW)).toBe(storedUrl);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
    const form = init?.body as FormData;
    expect(form.get('folder')).toBe('mishra-computer-centre/courses');
    expect(form.get('timestamp')).toBe('1795855864');
    expect(form.get('transformation')).toBe('c_limit,h_2000,w_2000');
    expect(form.get('api_key')).toBe('123456789012345');
    // SHA-1 of the three parameters above, sorted, followed by the secret.
    expect(form.get('signature')).toBe('5b30458f0f4ffb23fedf2ab96989080e89bde81a');
    const file = form.get('file') as Blob;
    expect(file.type).toBe('image/jpeg');
    expect(file.size).toBe(jpeg.length);
    // The secret is used to sign and is never sent.
    expect([...form.values()].some((value) => value === config.apiSecret)).toBe(false);
  });

  it('puts banners in their own folder', async () => {
    const fetchMock = answer({ secure_url: storedUrl.replace('/courses/', '/banners/') });
    await storeImage(config, 'banner', jpeg, 'jpeg', NOW);
    const form = fetchMock.mock.calls[0]?.[1]?.body as FormData;
    expect(form.get('folder')).toBe('mishra-computer-centre/banners');
  });

  it('answers with a URL the app accepts', async () => {
    answer({ secure_url: storedUrl });
    const url = await storeImage(config, 'course', jpeg, 'jpeg', NOW);
    expect(uploadImageResponseSchema.safeParse({ url }).success).toBe(true);
  });

  it('gives null when Cloudinary refuses, answers oddly, or cannot be reached', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    answer({ error: { message: 'Invalid Signature' } }, 401);
    expect(await storeImage(config, 'course', jpeg, 'jpeg', NOW)).toBeNull();

    // A picture that landed outside the app's folder could not be shown or removed later.
    answer({ secure_url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/abc123.jpg' });
    expect(await storeImage(config, 'course', jpeg, 'jpeg', NOW)).toBeNull();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    expect(await storeImage(config, 'course', jpeg, 'jpeg', NOW)).toBeNull();

    // What is logged never includes the secret or the key.
    const lines = logged.mock.calls.map((call) => call.join(' ')).join('\n');
    expect(lines).toContain('Invalid Signature');
    expect(lines).not.toContain(config.apiSecret);
    expect(lines).not.toContain(config.apiKey);
  });
});

describe('removing a picture', () => {
  it('sends a signed request that also clears Cloudinary’s copies', async () => {
    const fetchMock = answer({ result: 'ok' });

    expect(await removeImage(config, 'mishra-computer-centre/courses/abc123', NOW)).toBe(true);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('https://api.cloudinary.com/v1_1/demo-cloud/image/destroy');
    const body = init?.body as URLSearchParams;
    expect(body.get('public_id')).toBe('mishra-computer-centre/courses/abc123');
    expect(body.get('invalidate')).toBe('true');
    expect(body.get('timestamp')).toBe('1795855864');
    expect(body.get('signature')).toBe('1f462d98e34026e54c3d8e6d50060f52e68ca2c3');
    expect([...body.values()]).not.toContain(config.apiSecret);
  });

  it('counts a picture that is already gone as removed', async () => {
    answer({ result: 'not found' });
    expect(await removeImage(config, 'mishra-computer-centre/courses/abc123', NOW)).toBe(true);
  });

  it('gives false when Cloudinary refuses or cannot be reached', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    answer({ error: { message: 'Invalid Signature' } }, 401);
    expect(await removeImage(config, 'mishra-computer-centre/courses/abc123', NOW)).toBe(false);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    expect(await removeImage(config, 'mishra-computer-centre/courses/abc123', NOW)).toBe(false);
  });
});
