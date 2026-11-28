import {
  formatDuration,
  MAX_PLAYLIST_ITEMS,
  parseYouTubeUrl,
  playbackProblem,
  type YoutubeMetaResponse,
} from '@mcc/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Divider,
  Icon,
  Notice,
  spacing,
  TextField,
  Thumbnail,
  useTheme,
} from '@/ui';

import { useSaveVideoLessons, useYoutubeLookup } from '../../lessons/hooks';
import { ErrorNotice } from '../../shared/error-notice';
import { useSectionLessons } from '../hooks';

/** "12 videos found in the playlist “MS Word”", or "1 video found" for a single link. */
function summary(result: YoutubeMetaResponse): string {
  const count = `${result.items.length} video${result.items.length === 1 ? '' : 's'} found`;
  return result.playlistTitle ? `${count} in the playlist “${result.playlistTitle}”` : count;
}

/**
 * Paste a YouTube video or playlist link → see what YouTube has → choose which videos to add.
 * Videos that cannot play inside the app (Private, embedding off) are flagged and left unticked.
 */
export function AddYoutubePanel({ sectionId }: { sectionId: string }) {
  const { colors } = useTheme();
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
          <AppText variant="bodyStrong">{summary(result)}</AppText>
          {result.truncated ? (
            <Notice tone="warning">
              {`This playlist is longer than one import takes. Only the first ${MAX_PLAYLIST_ITEMS} videos are shown.`}
            </Notice>
          ) : null}
          <View>
            {result.items.map((item, index) => {
              const problem = playbackProblem(item);
              const checked = selected.has(item.videoId);
              return (
                <View key={item.videoId}>
                  {index > 0 ? <Divider inset={0} /> : null}
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel={problem ? `${item.title}. ${problem}` : item.title}
                    onPress={() => toggle(item.videoId)}
                    android_ripple={{ color: colors.surfaceMuted }}
                    style={({ pressed }) => [
                      styles.item,
                      pressed && { backgroundColor: colors.surfaceMuted },
                    ]}>
                    <Icon
                      name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      color={checked ? 'primary' : 'textMuted'}
                    />
                    <Thumbnail
                      uri={item.thumbnailUrl}
                      width={88}
                      fallbackIcon="play-circle-outline"
                      caption={
                        item.durationSeconds ? formatDuration(item.durationSeconds) : undefined
                      }
                    />
                    <View style={styles.itemText}>
                      <AppText variant="bodyStrong" numberOfLines={2}>
                        {item.title}
                      </AppText>
                      {problem ? (
                        <View style={styles.problem}>
                          <Icon name="alert-outline" size={15} color="warning" />
                          <AppText variant="caption" color="warning" style={styles.problemText}>
                            {problem}
                          </AppText>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
          <Button
            label={`Add ${selected.size} video${selected.size === 1 ? '' : 's'} to this unit`}
            icon="plus"
            disabled={selected.size === 0}
            loading={save.isPending || attach.isPending}
            onPress={() => void addSelected().catch(() => undefined)}
          />
        </View>
      ) : null}

      <ErrorNotice error={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  itemText: { flex: 1, gap: spacing.xs },
  problem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  problemText: { flex: 1 },
});
