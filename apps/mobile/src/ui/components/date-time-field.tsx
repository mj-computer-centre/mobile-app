import { formatDateTime, formatMonthYear, monthGrid, WEEKDAY_INITIALS } from '@mcc/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, useTheme } from '../theme';
import { AppText } from './app-text';
import { Button } from './button';
import { Icon } from './icon';
import { IconButton } from './icon-button';
import { KeyCap } from './key-cap';
import { SegmentedControl } from './segmented-control';
import { Sheet } from './sheet';

export interface DateTimeFieldProps {
  label: string;
  /** An ISO timestamp. */
  value: string;
  onChange: (iso: string) => void;
  error?: string | undefined;
  hint?: string;
}

const MINUTE_STEP = 5;

/**
 * A date and time, picked from a calendar of keys and a 12-hour clock. Written in plain React
 * Native so it is the same on the phone and the website and adds no native module to the app.
 * The time shown and picked is the device's own (Indian time, for the centre).
 */
export function DateTimeField({ label, value, onChange, error, hint }: DateTimeFieldProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const current = Number.isFinite(Date.parse(value)) ? new Date(value) : null;

  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current ? formatDateTime(current) : 'not set'}`}
        accessibilityHint="Opens a calendar"
        onPress={() => setOpen(true)}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border },
        ]}>
        <Icon name="calendar-clock-outline" size={20} color="textMuted" />
        <AppText style={styles.value} color={current ? 'text' : 'textFaint'}>
          {current ? formatDateTime(current) : 'Choose a date and time'}
        </AppText>
      </Pressable>
      {error ? (
        <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textMuted">
          {hint}
        </AppText>
      ) : null}
      {open ? (
        <Picker
          title={label}
          initial={current ?? new Date()}
          onClose={() => setOpen(false)}
          onDone={(date) => {
            onChange(date.toISOString());
            setOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}

function Picker({
  title,
  initial,
  onClose,
  onDone,
}: {
  title: string;
  initial: Date;
  onClose: () => void;
  onDone: (date: Date) => void;
}) {
  // Starts on the field's value, with minutes moved onto the picker's five-minute grid.
  const [draft, setDraft] = useState(() => {
    const start = new Date(initial);
    start.setMinutes(Math.round(start.getMinutes() / MINUTE_STEP) * MINUTE_STEP, 0, 0);
    return start;
  });
  const [view, setView] = useState({ year: draft.getFullYear(), month: draft.getMonth() });

  const change = (apply: (next: Date) => void) =>
    setDraft((previous) => {
      const next = new Date(previous);
      apply(next);
      return next;
    });
  const moveMonth = (by: number) =>
    setView((previous) => {
      const moved = new Date(previous.year, previous.month + by, 1);
      return { year: moved.getFullYear(), month: moved.getMonth() };
    });

  const hours = draft.getHours();
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const selectedDay =
    draft.getFullYear() === view.year && draft.getMonth() === view.month ? draft.getDate() : null;

  return (
    <Sheet visible onClose={onClose} title={title} closeLabel="Cancel">
      <View style={styles.monthRow}>
        <IconButton icon="chevron-left" label="Previous month" onPress={() => moveMonth(-1)} />
        <AppText variant="subheading" style={styles.month} accessibilityLiveRegion="polite">
          {formatMonthYear(view.year, view.month)}
        </AppText>
        <IconButton icon="chevron-right" label="Next month" onPress={() => moveMonth(1)} />
      </View>

      <View style={styles.calendar}>
        <View style={styles.week}>
          {WEEKDAY_INITIALS.map((initial, index) => (
            <View key={`${initial}-${index}`} style={styles.cell}>
              <AppText variant="tag" color="textMuted">
                {initial}
              </AppText>
            </View>
          ))}
        </View>
        {monthGrid(view.year, view.month).map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => (
              <View key={dayIndex} style={styles.cell}>
                {day === null ? null : (
                  <KeyCap
                    legend={String(day)}
                    size={38}
                    tone={day === selectedDay ? 'primary' : 'neutral'}
                    latched={day === selectedDay}
                    accessibilityLabel={`${day} ${formatMonthYear(view.year, view.month)}`}
                    accessibilityState={{ selected: day === selectedDay }}
                    onPress={() => change((next) => next.setFullYear(view.year, view.month, day))}
                  />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.timeRow}>
        <Stepper
          label="Hour"
          value={String(hour12)}
          onStep={(by) => change((next) => next.setHours(next.getHours() + by))}
        />
        <Stepper
          label="Minute"
          value={String(draft.getMinutes()).padStart(2, '0')}
          onStep={(by) => change((next) => next.setMinutes(next.getMinutes() + by * MINUTE_STEP))}
        />
        <View style={styles.meridiem}>
          <SegmentedControl
            accessibilityLabel="AM or PM"
            segments={[
              { value: 'am', label: 'AM' },
              { value: 'pm', label: 'PM' },
            ]}
            value={hours < 12 ? 'am' : 'pm'}
            onChange={(meridiem) =>
              change((next) => {
                const hour = next.getHours() % 12;
                next.setHours(meridiem === 'pm' ? hour + 12 : hour);
              })
            }
          />
        </View>
      </View>

      <AppText color="textMuted" style={styles.summary} accessibilityLiveRegion="polite">
        {formatDateTime(draft)}
      </AppText>
      <Button label="Done" onPress={() => onDone(draft)} />
    </Sheet>
  );
}

function Stepper({
  label,
  value,
  onStep,
}: {
  label: string;
  value: string;
  onStep: (by: 1 | -1) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.stepper}>
      <AppText variant="tag" color="textMuted">
        {label}
      </AppText>
      <View
        style={[
          styles.stepperBox,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}>
        <IconButton icon="minus" label={`${label} down`} onPress={() => onStep(-1)} />
        <AppText variant="subheading" style={styles.stepperValue}>
          {value}
        </AppText>
        <IconButton icon="plus" label={`${label} up`} onPress={() => onStep(1)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs + 2 },
  input: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  value: { flex: 1 },
  monthRow: { flexDirection: 'row', alignItems: 'center' },
  month: { flex: 1, textAlign: 'center' },
  calendar: { gap: spacing.xs },
  week: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 40 },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, flexWrap: 'wrap' },
  stepper: { gap: spacing.xs },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
  },
  stepperValue: { minWidth: 30, textAlign: 'center', fontVariant: ['tabular-nums'] },
  meridiem: { flexGrow: 1, minWidth: 120 },
  summary: { textAlign: 'center' },
});
