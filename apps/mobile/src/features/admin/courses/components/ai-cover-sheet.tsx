import { COVER_TAKES, toAppError } from '@mcc/shared';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { pickedFileFromDataUrl, type PickedFile } from '@/lib/platform/picked-file';
import {
  AppText,
  Button,
  Icon,
  Key,
  keyDepth,
  Notice,
  radius,
  Sheet,
  Skeleton,
  spacing,
  TextField,
  useTheme,
} from '@/ui';

import { drawCoverPicture } from '../api';

export interface AiCoverSheetProps {
  visible: boolean;
  onClose: () => void;
  /** The course as typed so far: the pictures are drawn for it. */
  title: string;
  description: string;
  /** Called with the picture the admin chose, in the shape of a picked file. */
  onChoose: (picture: PickedFile) => void;
}

type Take =
  | { status: 'drawing' }
  | { status: 'ready'; image: string }
  | { status: 'failed'; message: string };

const TILES_PER_ROW = 2;

/**
 * Draws four AI pictures for a course and lets the admin choose one. Each picture is asked for
 * on its own and appears as soon as it is drawn. Nothing is stored here: the chosen picture goes
 * to `onChoose`, which saves it like an uploaded one.
 */
export function AiCoverSheet({
  visible,
  onClose,
  title,
  description,
  onChoose,
}: AiCoverSheetProps) {
  const [details, setDetails] = useState('');
  const [takes, setTakes] = useState<Take[] | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  // Counts presses of "Make pictures", so a picture that arrives for an earlier press (or after
  // the sheet was closed) is dropped instead of landing in the new set.
  const run = useRef(0);

  const make = () => {
    const id = (run.current += 1);
    setChosen(null);
    setTakes(Array.from({ length: COVER_TAKES }, () => ({ status: 'drawing' })));
    for (let view = 0; view < COVER_TAKES; view += 1) {
      const settle = (take: Take) => {
        if (run.current !== id) return;
        setTakes((current) => current?.map((old, index) => (index === view ? take : old)) ?? null);
      };
      drawCoverPicture({ title, description, details, view }).then(
        (image) => settle({ status: 'ready', image }),
        (error: unknown) => settle({ status: 'failed', message: toAppError(error).message }),
      );
    }
  };

  const close = () => {
    run.current += 1;
    setTakes(null);
    setChosen(null);
    onClose();
  };

  const useChosen = () => {
    const take = chosen === null ? undefined : takes?.[chosen];
    const picture = take?.status === 'ready' ? pickedFileFromDataUrl(take.image, 'cover') : null;
    if (!picture) return;
    onChoose(picture);
    close();
  };

  const drawing = takes?.some((take) => take.status === 'drawing') ?? false;
  const failure = takes?.find((take) => take.status === 'failed');
  const allFailed = takes !== null && takes.every((take) => take.status === 'failed');
  const tiles: (Take | null)[] = takes ?? Array.from({ length: COVER_TAKES }, () => null);
  const rows = Array.from({ length: Math.ceil(tiles.length / TILES_PER_ROW) }, (_, row) =>
    tiles.slice(row * TILES_PER_ROW, (row + 1) * TILES_PER_ROW),
  );

  return (
    <Sheet
      visible={visible}
      tall
      onClose={close}
      title="Make a picture with AI"
      description={`For ${title}`}
      closeLabel="Cancel">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <TextField
          label="Anything to add? (optional)"
          placeholder="A calculator and a ledger book"
          hint="Name things to show. The AI cannot write words."
          value={details}
          onChangeText={setDetails}
          maxLength={200}
        />

        <View
          style={styles.grid}
          accessibilityRole="radiogroup"
          accessibilityLabel="Pictures to choose from">
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((take, column) => {
                const index = rowIndex * TILES_PER_ROW + column;
                return (
                  <TakeTile
                    key={index}
                    take={take}
                    number={index + 1}
                    chosen={chosen === index}
                    onChoose={() => setChosen(index)}
                  />
                );
              })}
            </View>
          ))}
        </View>

        {allFailed && failure?.status === 'failed' ? (
          <Notice tone="danger">
            <AppText accessibilityLiveRegion="polite">{failure.message}</AppText>
          </Notice>
        ) : (
          <AppText variant="caption" color="textMuted">
            {takes === null
              ? 'Free. It takes about ten seconds, and nothing is saved until you choose a picture.'
              : 'These pictures only suggest the subject; they are not photos of the centre. Choose one with no writing on it.'}
          </AppText>
        )}

        {takes === null || allFailed ? (
          <Button
            label={takes === null ? `Make ${COVER_TAKES} pictures` : 'Try again'}
            icon={takes === null ? 'creation' : 'refresh'}
            onPress={make}
          />
        ) : (
          <>
            <Button label="Use this picture" disabled={chosen === null} onPress={useChosen} />
            <Button
              label={`Make ${COVER_TAKES} more`}
              icon="refresh"
              variant="secondary"
              disabled={drawing}
              onPress={make}
            />
          </>
        )}
      </ScrollView>
    </Sheet>
  );
}

/**
 * One of the four pictures: empty before the first press, a skeleton while it is drawn, then a
 * key that stays down once chosen. Every state is the same size, so nothing moves as pictures
 * arrive. The picture is square and shown cropped to 16:9 from the centre, as a cover will be.
 */
function TakeTile({
  take,
  number,
  chosen,
  onChoose,
}: {
  take: Take | null;
  number: number;
  chosen: boolean;
  onChoose: () => void;
}) {
  const { colors } = useTheme();
  const ready = take?.status === 'ready';

  return (
    <Key
      tone={chosen ? 'primary' : 'neutral'}
      depth={keyDepth.md}
      cornerRadius={radius.md}
      latched={chosen}
      onPress={ready ? onChoose : undefined}
      accessibilityRole="radio"
      accessibilityLabel={`Picture ${number}`}
      accessibilityState={{ selected: chosen, checked: chosen }}
      style={styles.tile}
      faceStyle={styles.tileFace}>
      <View style={[styles.picture, { backgroundColor: colors.surfaceMuted }]}>
        {ready ? (
          <Image
            source={{ uri: take.image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
        ) : take?.status === 'drawing' ? (
          <View
            style={StyleSheet.absoluteFill}
            accessibilityRole="progressbar"
            accessibilityLabel={`Drawing picture ${number}`}>
            <Skeleton width="100%" height="100%" rounded={0} />
          </View>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.empty]}>
            <Icon
              name={take?.status === 'failed' ? 'image-off-outline' : 'image-outline'}
              size={26}
              color="textFaint"
            />
            {take?.status === 'failed' ? (
              <AppText variant="tag" color="textMuted" style={styles.centred}>
                Could not draw this one
              </AppText>
            ) : null}
          </View>
        )}
        {chosen ? (
          <View
            style={[
              styles.check,
              { backgroundColor: colors.primary, borderColor: colors.onPrimary },
            ]}>
            <Icon name="check-bold" size={14} color="onPrimary" />
          </View>
        ) : null}
      </View>
    </Key>
  );
}

const FRAME = 3;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: spacing.lg, paddingBottom: spacing.xl },
  grid: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  tile: { flex: 1 },
  // The face shows as a frame around the picture: plain normally, the primary colour once chosen.
  tileFace: { alignItems: 'stretch', padding: FRAME },
  picture: { aspectRatio: 16 / 9, borderRadius: radius.md - FRAME, overflow: 'hidden' },
  empty: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs, padding: spacing.sm },
  centred: { textAlign: 'center' },
  check: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    // A ring in the legend's colour, so the tick stands out on a picture of any colour.
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
