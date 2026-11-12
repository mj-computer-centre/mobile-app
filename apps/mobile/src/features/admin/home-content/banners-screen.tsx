import { moveItem, toAppError } from '@mcc/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCourses } from '@/features/catalog';
import { confirmAction, showMessage } from '@/lib/platform/confirm';
import { pickImage } from '@/lib/platform/picked-file';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  spacing,
  SwitchRow,
  Thumbnail,
} from '@/ui';

import { PickFromListModal } from '../shared/pick-from-list-modal';
import { ReorderControls } from '../shared/reorder-controls';
import type { AdminBanner } from './api';
import { useAllBanners, useBannerActions } from './hooks';

export function BannersScreen() {
  const banners = useAllBanners();
  const courses = useCourses({ includeDrafts: true });
  const actions = useBannerActions();
  const [linking, setLinking] = useState<AdminBanner | null>(null);

  if (banners.isPending) return <LoadingState />;
  if (banners.isError)
    return <ErrorState error={banners.error} onRetry={() => void banners.refetch()} />;
  const list = banners.data;
  const courseTitle = (id: string | null) => courses.data?.find((c) => c.id === id)?.title;
  const onError = (title: string) => (error: unknown) =>
    showMessage(title, toAppError(error).message);

  const add = async () => {
    const file = await pickImage();
    if (file)
      actions.add.mutate(
        { file, position: list.length },
        { onError: onError('Could not add the banner') },
      );
  };

  const remove = async (banner: AdminBanner) => {
    const ok = await confirmAction({
      title: 'Delete this banner?',
      message: 'The picture is removed.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (ok) actions.remove.mutate(banner, { onError: onError('Could not delete the banner') });
  };

  return (
    <Screen edges={[]}>
      <AppText color="textMuted">
        Pictures that slide at the top of the Home screen. Tapping one can open a course.
      </AppText>
      <Button
        label="Add banner"
        icon="image-plus"
        loading={actions.add.isPending}
        onPress={() => void add()}
      />
      {list.length === 0 ? (
        <EmptyState icon="image-multiple-outline" title="No banners yet" />
      ) : null}
      {list.map((banner, index) => (
        <Card key={banner.id}>
          <View style={styles.body}>
            <Thumbnail uri={banner.imageUrl} />
            <SwitchRow
              label="Show on Home"
              value={banner.isActive}
              onValueChange={(isActive) => actions.update.mutate({ id: banner.id, isActive })}
            />
            <AppText variant="caption" color="textMuted">
              {banner.courseId
                ? `Opens: ${courseTitle(banner.courseId) ?? 'a course'}`
                : 'Does not open a course'}
            </AppText>
            <View style={styles.row}>
              <Button
                label="Link to a course"
                compact
                variant="secondary"
                onPress={() => setLinking(banner)}
              />
              {banner.courseId ? (
                <Button
                  label="Unlink"
                  compact
                  variant="ghost"
                  onPress={() => actions.update.mutate({ id: banner.id, courseId: null })}
                />
              ) : null}
              <View style={styles.spacer} />
              <ReorderControls
                itemLabel={`banner ${index + 1}`}
                index={index}
                count={list.length}
                disabled={actions.reorder.isPending}
                onMove={(from, to) =>
                  actions.reorder.mutate(moveItem(list, from, to).map((b) => b.id))
                }
                onRemove={() => void remove(banner)}
                removeLabel="Delete"
              />
            </View>
          </View>
        </Card>
      ))}
      <PickFromListModal
        visible={linking !== null}
        title="Open which course?"
        items={courses.data?.map((c) => ({ id: c.id, title: c.title }))}
        emptyMessage="No courses yet."
        onPick={(courseId) => linking && actions.update.mutate({ id: linking.id, courseId })}
        onClose={() => setLinking(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  spacer: { flex: 1 },
});
