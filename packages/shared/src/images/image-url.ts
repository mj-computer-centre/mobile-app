import { isCloudinaryImage } from './image-contract';

/**
 * The widths the app asks Cloudinary for. Only these, so each picture is resized a handful of
 * times at most: a cover is at most about 360 points wide on a phone (960 px covers a 2.5x
 * screen), and a banner fills the page.
 */
export const IMAGE_WIDTHS = { cover: 960, banner: 1280 } as const;

/**
 * A Cloudinary picture as the app shows it: cropped to 16:9 from the centre (an AI picture is
 * square, a photo can be any shape), never enlarged past `width`, and sent in the smallest
 * format the device accepts. A cover comes out at 15 to 30 KB instead of the 300 KB that was
 * uploaded, which is what a student on mobile data downloads.
 *
 * The crop is from the centre, not Cloudinary's automatic one, so that it is the same crop the
 * admin saw when choosing the picture.
 */
export function sizedImageUrl(url: string, width: number): string {
  return url.replace(
    '/image/upload/',
    `/image/upload/c_fill,ar_16:9/c_limit,w_${width}/f_auto,q_auto/`,
  );
}

/**
 * The URL to show for what `courses.thumbnail_path` or `banners.image_path` holds: a Cloudinary
 * picture at the given width, or a picture from before Cloudinary through `bucketUrl`.
 */
export function storedImageUrl(
  stored: string,
  width: number,
  bucketUrl: (path: string) => string,
): string {
  return isCloudinaryImage(stored) ? sizedImageUrl(stored, width) : bucketUrl(stored);
}
