import { toAppError, type AnswerSheet, type MyTest, type TestAttempt } from '@mcc/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { confirmAction } from '@/lib/platform/confirm';
import {
  AppText,
  Button,
  EmptyState,
  IconButton,
  Notice,
  ProgressBar,
  radius,
  Screen,
  Sheet,
  spacing,
  useLayout,
  useTheme,
} from '@/ui';

import type { TestPaper } from '../api';
import { testsKeys, useSubmitTest } from '../hooks';
import { useAnswerSaver } from '../use-answer-saver';
import { QuestionGrid } from './question-grid';
import { QuestionView } from './question-view';
import { SaveStatusLine } from './save-status-line';
import { TestClock } from './test-clock';
import { TimeUpPanel } from './time-up-panel';
import { TimeUpWatcher } from './time-up-watcher';

export interface TestRunnerProps {
  test: MyTest;
  attempt: TestAttempt;
  /** The questions and the answers saved so far. Read once, when the screen opens. */
  paper: TestPaper;
  clockOffsetMs: number;
  /** Back to the test's own page. */
  onLeave: () => void;
}

/** Where to begin: the first question without an answer, so coming back carries on. */
function firstUnanswered(paper: TestPaper): number {
  const index = paper.questions.findIndex((question) => paper.answers[question.id] === undefined);
  return index === -1 ? 0 : index;
}

/**
 * A test being taken. The answers live here, on the device, and are the truth for as long as
 * the screen is open: each choice shows at once and is saved in the background, and Submit
 * sends every answer again. Nothing the network does can block the student or lose an answer.
 *
 * When the time runs out the answers are submitted by themselves. When Submit succeeds the
 * list of tests learns that the attempt is finished, and the screen that owns this one leaves.
 */
export function TestRunner({ test, attempt, paper, clockOffsetMs, onLeave }: TestRunnerProps) {
  const { isWide } = useLayout();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const questions = paper.questions;
  const total = questions.length;

  const [answers, setAnswers] = useState<AnswerSheet>(paper.answers);
  const [index, setIndex] = useState(() => firstUnanswered(paper));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [clockRanOut, setClockRanOut] = useState(false);
  const saver = useAnswerSaver(attempt.id);
  const {
    mutate: submitAnswers,
    isPending: submitting,
    error: submitError,
  } = useSubmitTest(attempt.id);

  // The server can call time a moment before this device's clock does.
  const timeIsUp = clockRanOut || saver.status.failure === 'test_time_over';
  // Submitted from another phone or browser while this one was open.
  const submittedElsewhere = saver.status.failure === 'test_already_submitted';
  const paletteVisible = paletteOpen && !timeIsUp;
  const blocked = paletteVisible || timeIsUp || submitting || submittedElsewhere;

  const question = questions[Math.min(index, total - 1)];
  const answered = questions.filter((item) => answers[item.id] !== undefined).length;
  const left = total - answered;
  const isLast = index >= total - 1;
  const counts = `${answered} answered, ${left} left`;

  const go = (by: number) => setIndex((current) => Math.min(total - 1, Math.max(0, current + by)));

  const choose = (questionId: string, option: number | null) => {
    if (submitting || timeIsUp) return;
    setAnswers((current) => {
      const next = { ...current };
      if (option === null) delete next[questionId];
      else next[questionId] = option;
      return next;
    });
    saver.save({ [questionId]: option });
  };

  // Both questions below are asked over whatever is open, and the sheet closes only after the
  // answer: a dialog raised while a sheet is still sliding away can fail to appear on iOS.
  const askSubmit = async () => {
    const ok = await confirmAction({
      title: 'Submit the test?',
      message:
        left > 0
          ? `${left} question${left === 1 ? ' is' : 's are'} not answered. You cannot change your answers after submitting.`
          : 'You have answered every question. You cannot change your answers after submitting.',
      confirmLabel: 'Submit test',
    });
    if (!ok) return;
    setPaletteOpen(false);
    submitAnswers(answers);
  };

  const askLeave = async () => {
    const ok = await confirmAction({
      title: 'Leave the test for now?',
      message:
        'The clock keeps running. Come back before your time ends to carry on. The answers you have saved are kept.',
      confirmLabel: 'Leave',
    });
    if (!ok) return;
    setPaletteOpen(false);
    // One more try for anything not saved yet; leaving does not wait for it.
    void saver.flush();
    onLeave();
  };

  // On the website the keyboard answers too: A to F choose, the arrows move.
  const onKey = (event: KeyboardEvent) => {
    if (blocked || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'ArrowRight') go(1);
    else if (event.key === 'ArrowLeft') go(-1);
    else if (question && /^[a-f]$/i.test(event.key)) {
      const option = event.key.toLowerCase().charCodeAt(0) - 97;
      if (option < question.options.length) choose(question.id, option);
    }
  };

  // The listeners below are attached once; this keeps them calling the newest handlers.
  const latest = useRef({ onKey, askLeave, hasUnsaved: saver.hasUnsaved });
  useEffect(() => {
    latest.current = { onKey, askLeave, hasUnsaved: saver.hasUnsaved };
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      // The back button asks before leaving, like the Leave button does.
      const back = BackHandler.addEventListener('hardwareBackPress', () => {
        void latest.current.askLeave();
        return true;
      });
      return () => back.remove();
    }
    if (Platform.OS !== 'web') return undefined;

    const keydown = (event: KeyboardEvent) => latest.current.onKey(event);
    // Closing or reloading the tab with unsent answers asks first.
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (latest.current.hasUnsaved()) event.preventDefault();
    };
    window.addEventListener('keydown', keydown);
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, []);

  // Time is up: send the answers, once. The ref makes sure a re-render cannot send them twice.
  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (timeIsUp && !autoSubmitted.current) {
      autoSubmitted.current = true;
      submitAnswers(answers);
    }
  }, [timeIsUp, answers, submitAnswers]);

  // Fetch the list again so it shows the attempt as finished; the owning screen then leaves.
  useEffect(() => {
    if (submittedElsewhere) void queryClient.invalidateQueries({ queryKey: testsKeys.mine });
  }, [submittedElsewhere, queryClient]);

  const watcher = (
    <TimeUpWatcher
      deadlineAt={attempt.deadlineAt}
      clockOffsetMs={clockOffsetMs}
      onTimeUp={() => setClockRanOut(true)}
    />
  );

  if (!question) {
    return (
      <EmptyState
        icon="clipboard-text-off-outline"
        title="This test has no questions now"
        message="The centre changed the test while you had it open. Go back and check it again."
        action={{ label: 'Back to the test', onPress: onLeave }}
      />
    );
  }
  if (submittedElsewhere) {
    return (
      <EmptyState
        icon="clipboard-check-outline"
        title="This test has already been submitted"
        message="It was submitted from another phone or browser."
        action={{ label: 'See the result', onPress: onLeave }}
      />
    );
  }
  if (timeIsUp) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: test.title, headerRight: () => null }} />
        <TimeUpPanel
          sending={submitting}
          error={submitError}
          onRetry={() => submitAnswers(answers)}
          onLeave={onLeave}
        />
      </Screen>
    );
  }

  const failure = submitError ? toAppError(submitError) : null;
  const progress = (
    <View style={styles.progress}>
      <AppText variant="label">
        Question {index + 1} of {total}
      </AppText>
      <ProgressBar
        value={answered / total}
        accessibilityLabel={`${answered} of ${total} questions answered`}
      />
    </View>
  );
  const failureNotice = failure ? (
    <Notice
      tone="danger"
      title="The test could not be submitted"
      action={
        failure.code === 'invalid_answer' ? (
          <Button
            label="Submit the saved answers"
            variant="secondary"
            compact
            onPress={() => submitAnswers({})}
          />
        ) : undefined
      }>
      {failure.code === 'invalid_answer'
        ? 'The test was changed while you were taking it, so some answers could not be sent. You can submit the answers that were already saved.'
        : `${failure.message} Your answers are still here. Try again.`}
    </Notice>
  ) : null;
  const questionView = (
    <QuestionView
      question={question}
      number={index + 1}
      selected={answers[question.id]}
      locked={submitting}
      onChoose={(option) => choose(question.id, option)}
    />
  );
  const grid = (
    <QuestionGrid
      questions={questions}
      answers={answers}
      current={index}
      onJump={(next) => {
        setIndex(next);
        setPaletteOpen(false);
      }}
    />
  );

  if (isWide) {
    return (
      <Screen edges={[]} width="wide">
        <Stack.Screen options={{ title: test.title, headerRight: () => null }} />
        {watcher}
        <View style={styles.columns}>
          <View style={styles.main}>
            {progress}
            {failureNotice}
            {questionView}
            <View style={styles.moves}>
              <Button
                label="Previous"
                variant="secondary"
                icon="chevron-left"
                disabled={index === 0}
                onPress={() => go(-1)}
              />
              <Button
                label="Next"
                iconAfter="chevron-right"
                disabled={isLast}
                onPress={() => go(1)}
              />
            </View>
            {Platform.OS === 'web' ? (
              <AppText variant="caption" color="textMuted">
                On a keyboard, press A to F to choose an answer and the arrow keys to move between
                questions.
              </AppText>
            ) : null}
          </View>

          <View
            style={[styles.side, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.clock}>
              <AppText variant="tag" color="textMuted">
                Time left
              </AppText>
              <TestClock
                deadlineAt={attempt.deadlineAt}
                clockOffsetMs={clockOffsetMs}
                size="large"
              />
            </View>
            <AppText variant="caption" color="textMuted">
              {counts}
            </AppText>
            {grid}
            <Button
              label="Submit test"
              variant="accent"
              loading={submitting}
              onPress={() => void askSubmit()}
            />
            <SaveStatusLine status={saver.status} />
            <Button label="Leave for now" variant="ghost" compact onPress={() => void askLeave()} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      edges={['bottom']}
      bottomBar={
        <View
          style={[styles.bar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <IconButton
            icon="view-grid-outline"
            label={`All questions. ${counts}`}
            color="text"
            tonal
            onPress={() => setPaletteOpen(true)}
          />
          <Button
            label="Previous"
            variant="secondary"
            icon="chevron-left"
            disabled={index === 0}
            onPress={() => go(-1)}
            style={styles.barButton}
          />
          {isLast ? (
            <Button
              label="Submit"
              variant="accent"
              loading={submitting}
              onPress={() => void askSubmit()}
              style={styles.barButton}
            />
          ) : (
            <Button
              label="Next"
              iconAfter="chevron-right"
              onPress={() => go(1)}
              style={styles.barButton}
            />
          )}
        </View>
      }>
      <Stack.Screen
        options={{
          title: test.title,
          headerRight: () => (
            <View style={styles.headerClock}>
              <TestClock deadlineAt={attempt.deadlineAt} clockOffsetMs={clockOffsetMs} />
            </View>
          ),
        }}
      />
      {watcher}
      <View style={styles.top}>
        {progress}
        <SaveStatusLine status={saver.status} />
      </View>
      {failureNotice}
      {questionView}

      <Sheet
        visible={paletteVisible}
        onClose={() => setPaletteOpen(false)}
        title="All questions"
        description={counts}>
        <ScrollView style={styles.sheetGrid}>{grid}</ScrollView>
        <Button
          label="Submit test"
          variant="accent"
          loading={submitting}
          onPress={() => void askSubmit()}
        />
        <Button label="Leave for now" variant="ghost" onPress={() => void askLeave()} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // The web's header puts its right-hand content against the edge; a phone's adds its own inset.
  headerClock: { marginRight: Platform.OS === 'web' ? spacing.lg : 0 },
  top: { gap: spacing.sm },
  progress: { gap: spacing.sm },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  barButton: { flex: 1 },
  // A test can have 200 questions; the grid scrolls inside the sheet.
  sheetGrid: { maxHeight: 300, flexGrow: 0 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxl },
  main: { flex: 3, minWidth: 0, gap: spacing.xl },
  moves: { flexDirection: 'row', gap: spacing.md },
  side: {
    flex: 2,
    minWidth: 0,
    maxWidth: 380,
    padding: spacing.xl,
    gap: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  clock: { gap: spacing.xs },
});
