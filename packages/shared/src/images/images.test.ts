import { describe, expect, it } from 'vitest';

import {
  IMAGE_KINDS,
  isCloudinaryImage,
  removeImagesRequestSchema,
  removeImagesResponseSchema,
  uploadImageResponseSchema,
} from './image-contract';
import { IMAGE_WIDTHS, sizedImageUrl, storedImageUrl } from './image-url';

const stored =
  'https://res.cloudinary.com/demo-cloud/image/upload/v1795855864/mishra-computer-centre/courses/er0a77jk.jpg';

describe('where a picture is kept', () => {
  it('knows a Cloudinary picture from a path in the old bucket', () => {
    expect(isCloudinaryImage(stored)).toBe(true);
    expect(isCloudinaryImage('courses/7f3c/1732790000.jpg')).toBe(false);
    expect(isCloudinaryImage('banners/on.jpg')).toBe(false);
  });

  it('treats nothing else as a URL', () => {
    expect(isCloudinaryImage('https://example.com/a.jpg')).toBe(false);
    expect(isCloudinaryImage('http://res.cloudinary.com/demo/image/upload/a.jpg')).toBe(false);
    expect(
      isCloudinaryImage('https://res.cloudinary.com.example.com/demo/image/upload/a.jpg'),
    ).toBe(false);
    expect(isCloudinaryImage('https://res.cloudinary.com/demo/video/upload/a.mp4')).toBe(false);
    expect(isCloudinaryImage(` ${stored}`)).toBe(false);
  });
});

describe('the URL the app shows', () => {
  it('asks Cloudinary for a 16:9 crop from the centre at the width, in the smallest format', () => {
    expect(sizedImageUrl(stored, 960)).toBe(
      'https://res.cloudinary.com/demo-cloud/image/upload/c_fill,ar_16:9/c_limit,w_960/f_auto,q_auto/v1795855864/mishra-computer-centre/courses/er0a77jk.jpg',
    );
  });

  it('uses one width for covers and a larger one for banners', () => {
    expect(IMAGE_WIDTHS.cover).toBeLessThan(IMAGE_WIDTHS.banner);
    expect(sizedImageUrl(stored, IMAGE_WIDTHS.banner)).toContain('/c_limit,w_1280/');
  });

  it('sends a picture from before Cloudinary to the bucket, unchanged', () => {
    const bucketUrl = (path: string) => `https://project.test/storage/media/${path}`;
    expect(storedImageUrl('banners/on.jpg', 1280, bucketUrl)).toBe(
      'https://project.test/storage/media/banners/on.jpg',
    );
    expect(storedImageUrl(stored, 960, bucketUrl)).toBe(sizedImageUrl(stored, 960));
    // A link to somewhere else is never followed: it is looked for in the bucket and not found.
    expect(storedImageUrl('https://example.com/a.jpg', 960, bucketUrl)).toBe(
      'https://project.test/storage/media/https://example.com/a.jpg',
    );
  });
});

describe('the contracts shared with the picture functions', () => {
  it('has a kind for each thing that carries a picture', () => {
    expect([...IMAGE_KINDS]).toEqual(['course', 'banner']);
  });

  it('accepts only a Cloudinary picture as the place a picture was stored', () => {
    expect(uploadImageResponseSchema.safeParse({ url: stored }).success).toBe(true);
    expect(uploadImageResponseSchema.safeParse({ url: 'courses/a.jpg' }).success).toBe(false);
    expect(uploadImageResponseSchema.safeParse({ url: 'https://example.com/a.jpg' }).success).toBe(
      false,
    );
    expect(
      uploadImageResponseSchema.safeParse({ url: `${stored}${'a'.repeat(300)}` }).success,
    ).toBe(false);
  });

  it('removes between one and ten pictures at a time', () => {
    expect(removeImagesRequestSchema.safeParse({ urls: [] }).success).toBe(false);
    expect(removeImagesRequestSchema.safeParse({ urls: [stored] }).success).toBe(true);
    expect(
      removeImagesRequestSchema.safeParse({ urls: Array.from({ length: 11 }, () => stored) })
        .success,
    ).toBe(false);
    expect(removeImagesResponseSchema.parse({ removed: 1 })).toEqual({ removed: 1 });
    expect(removeImagesResponseSchema.safeParse({ removed: -1 }).success).toBe(false);
  });
});
