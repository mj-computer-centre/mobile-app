import {
  formatDuration,
  parseYouTubeUrl,
  playbackProblem,
  toAppError,
  type YoutubeMetaResponse,
} from '@mcc/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, Button, Icon, spacing, TextField, Thumbnail } from '@/ui';

import { useSaveVideoLessons, useYoutubeLookup } from '../../lessons/hooks';
import { useSectionLessons } from '../hooks';

/**
 * Paste a YouTube video or playlist link → see what YouTube has → choose which videos to add.
 * Videos that cannot play inside the app (Private, embedding off) are flagged and left unticked.
 */
export function AddYoutubePanel({ sectionId }: { sectionId: string }) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<YoutubeMetaResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const lookup = useYoutubeLookup();
  const save = useSaveVideoLessons();
  const { attach } = useSectionLessons(sectionId);

  const linkLooksValid = parseYouTubeUrl(url) !== null;
  const error = lookup.error ?? save.error ?? attach.error;

  const find = () =>
    lookup.mutate(url, {
      onSuccess: (meta) => {
        setResult(meta);
        setSelected(
          new Set(meta.items.filter((item) => !playbackProblem(item)).map((item) => item.videoId)),
        );
      },
    });

  const toggle = (videoId: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });

  const addSelected = async () => {
    if (!result) return;
    const videos = result.items.filter((item) => selected.has(item.videoId));
    const lessonIds = await save.mutateAsync(videos);
    await attach.mutateAsync(lessonIds);
    setResult(null);
    setUrl('');
  };

  return (
    <View style={styles.panel}>
      <TextField
        label="YouTube video or playlist link"
        placeholder="https://youtube.com/playlist?list=…"
        value={url}
        onChangeText={(text) => {
          setUrl(text);
          setResult(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        error={url && !linkLooksValid ? 'This is not a YouTube video or playlist link' : undefined}
      />
      <Button
        label="Find"
        icon="magnify"
        variant="secondary"
        loading={lookup.isPending}
        disabled={!linkLooksValid}
        onPress={find}
      />

      {result ? (
        <View style={styles.panel}>
          <AppText variant="label">
            {result.playlistTitle ? `Playlist: ${result.playlistTitle}` : 'Video'} ·{' '}
            {result.items.length} found
          </AppText>
          {result.truncated ? (
            <Badge label="Only the first 200 videos are shown" tone="warning" />
          ) : null}
          {result.items.map((item) => {
            const problem = playbackProblem(item);
            const checked = selected.has(item.videoId);
            return (
              <Pressable
                key={item.videoId}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                accessibilityLabel={item.title}
                onPress={() => toggle(item.videoId)}
                style={styles.item}>
                <Icon
                  name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  color={checked ? 'primary' : 'textMuted'}
                />
                <Thumbnail uri={item.thumbnailUrl} width={88} />
                <View style={styles.itemText}>
                  <AppText variant="label" numberOfLines={2}>
                    {item.title}
                  </AppText>
                  {item.durationSeconds ? (
                    <AppText variant="caption" color="textMuted">
                      {formatDuration(item.durationSeconds)}
                    </AppText>
                  ) : null}
                  {problem ? (
                    <AppText variant="caption" color="warning">
                      {problem}
                    </AppText>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
          <Button
            label={`Add ${selected.size} video${selected.size === 1 ? '' : 's'} to this unit`}
            icon="plus"
            disabled={selected.size === 0}
            loading={save.isPending || attach.isPending}
            onPress={() => void addSelected().catch(() => undefined)}
          />
        </View>
      ) : null}

      {error ? (
        <AppText color="danger" accessibilityLiveRegion="polite">
          {toAppError(error).message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  itemText: { flex: 1, gap: 2 },
});
