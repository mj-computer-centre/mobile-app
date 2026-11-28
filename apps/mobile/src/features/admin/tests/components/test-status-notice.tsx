import { formatDateTime } from '@mcc/shared';
import type { ReactNode } from 'react';

import { Notice, type Tone } from '@/ui';

import type { TestRecord } from '../api';

interface Status {
  tone: Tone;
  title: string;
  text: string;
}

/** Where a test stands right now, in the words staff would use for it. */
function statusOf(test: TestRecord, questionCount: number | undefined, now: number): Status {
  if (!test.is_published) {
    return {
      tone: 'warning',
      title: 'Draft',
      text:
        questionCount === 0
          ? 'Students cannot see this test yet. Add its questions, then switch on “Show to students” and save.'
          : 'Students cannot see this test yet. When the questions are ready, switch on “Show to students” and save.',
    };
  }
  if (questionCount === 0) {
    return {
      tone: 'danger',
      title: 'No questions yet',
      text: 'Students can see this test but cannot start it. Add its questions below.',
    };
  }
  if (now < Date.parse(test.starts_at)) {
    return {
      tone: 'primary',
      title: 'Students can see this test',
      text: `It opens on ${formatDateTime(test.starts_at)}.`,
    };
  }
  if (now < Date.parse(test.ends_at)) {
    return {
      tone: 'success',
      title: 'Open now',
      text: `Students can start it until ${formatDateTime(test.ends_at)}.`,
    };
  }
  return {
    tone: 'neutral',
    title: 'This test has ended',
    text: test.allow_late
      ? 'Students who missed it can still take it. Their test is marked as taken late.'
      : 'Students who missed it cannot take it now. To let them, switch on “Let students who missed it take it later” and save.',
  };
}

/** A message at the top of the test editor saying where the test stands, with a way to its results. */
export function TestStatusNotice({
  test,
  questionCount,
  now,
  action,
}: {
  test: TestRecord;
  /** Undefined while the questions are loading. */
  questionCount: number | undefined;
  /** The device's time when the screen was opened. */
  now: number;
  action?: ReactNode;
}) {
  const status = statusOf(test, questionCount, now);
  return (
    <Notice tone={status.tone} title={status.title} action={action}>
      {status.text}
    </Notice>
  );
}
