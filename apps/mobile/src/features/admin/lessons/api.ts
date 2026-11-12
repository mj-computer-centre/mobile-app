import {
  BUCKETS,
  LIMITS,
  notesPath,
  youtubeMetaResponseSchema,
  type LessonKind,
  type YoutubeMetaResponse,
  type YoutubeVideoMeta,
} from '@mcc/shared';
import { randomUUID } from 'expo-crypto';

import { invokeFunction, run, runVoid } from '@/lib/data';
import type { PickedFile } from '@/lib/platform/picked-file';
import { supabase } from '@/lib/supabase';

import { removeFiles, uploadFile } from '../shared/uploads';

/** Title, thumbnail, duration and playability of a video, or of every video in a playlist. */
export async function fetchYoutubeMeta(url: string): Promise<YoutubeMetaResponse> {
  return invokeFunction('youtube-meta', { url }, youtubeMetaResponseSchema);
}

/**
 * Makes sure each video exists in the library and returns lesson ids in the same order.
 * Videos already in the library keep their (possibly renamed) titles.
 */
export async function saveVideoLessons(videos: YoutubeVideoMeta[]): Promise<string[]> {
  if (videos.length === 0) return [];
  const db = supabase();
  const youtubeIds = videos.map((video) => video.videoId);

  const existing = await run(
    db.from('lessons').select('id, youtube_video_id').in('youtube_video_id', youtubeIds),
  );
  const idByVideo = new Map(existing.map((row) => [row.youtube_video_id, row.id]));

  const missing = videos.filter((video) => !idByVideo.has(video.videoId));
  if (missing.length > 0) {
    const inserted = await run(
      db
        .from('lessons')
        .insert(
          missing.map((video) => ({
            kind: 'video' as const,
            title: video.title,
            youtube_video_id: video.videoId,
            duration_seconds: video.durationSeconds,
            thumbnail_url: video.thumbnailUrl,
          })),
        )
        .select('id, youtube_video_id'),
    );
    for (const row of inserted) idByVideo.set(row.youtube_video_id, row.id);
  }

  return youtubeIds.flatMap((videoId) => {
    const id = idByVideo.get(videoId);
    return id ? [id] : [];
  });
}

/** Uploads a PDF and creates its lesson. If saving the lesson fails, the upload is removed. */
export async function createPdfLesson(file: PickedFile, title: string): Promise<string> {
  const id = randomUUID();
  const path = notesPath(id);
  await uploadFile(BUCKETS.notes, path, file, LIMITS.pdfBytes);
  try {
    await runVoid(
      supabase().from('lessons').insert({
        id,
        kind: 'pdf',
        title: title.trim(),
        pdf_path: path,
        pdf_size_bytes: file.sizeBytes,
      }),
    );
  } catch (error) {
    await removeFiles(BUCKETS.notes, [path]);
    throw error;
  }
  return id;
}

export async function renameLesson(lessonId: string, title: string): Promise<void> {
  await runVoid(supabase().from('lessons').update({ title: title.trim() }).eq('id', lessonId));
}

/** Deletes a lesson from the library and every unit; a PDF's file goes with it. */
export async function deleteLesson(lesson: { id: string; pdfPath: string | null }): Promise<void> {
  await runVoid(supabase().from('lessons').delete().eq('id', lesson.id));
  if (lesson.pdfPath) await removeFiles(BUCKETS.notes, [lesson.pdfPath]);
}

export interface LibraryLesson {
  id: string;
  kind: LessonKind;
  title: string;
  youtubeVideoId: string | null;
  pdfPath: string | null;
  sectionCount: number;
  attachedToVideoCount: number;
}

export async function fetchLibraryLessons(): Promise<LibraryLesson[]> {
  const db = supabase();
  const [lessons, usage] = await Promise.all([
    run(
      db
        .from('lessons')
        .select('id, kind, title, youtube_video_id, pdf_path')
        .order('created_at', { ascending: false }),
    ),
    run(db.from('lesson_usage').select('lesson_id, section_count, attached_to_video_count')),
  ]);
  const usageById = new Map(usage.map((row) => [row.lesson_id, row]));
  return lessons.map((lesson) => {
    const used = usageById.get(lesson.id);
    return {
      id: lesson.id,
      kind: lesson.kind,
      title: lesson.title,
      youtubeVideoId: lesson.youtube_video_id,
      pdfPath: lesson.pdf_path,
      sectionCount: used?.section_count ?? 0,
      attachedToVideoCount: used?.attached_to_video_count ?? 0,
    };
  });
}
