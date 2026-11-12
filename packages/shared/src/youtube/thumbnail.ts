/** YouTube's own thumbnail for a video; used when a lesson has no stored thumbnail. */
export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
