import { toAppError, type ErrorCode } from '@mcc/shared';
import { useEffect, useState, useSyncExternalStore } from 'react';

import type { AnswerChanges } from './api';
import { useSaveAnswers } from './hooks';

/** Where the answers stand: nothing chosen yet, being sent, all sent, or some waiting. */
export type SaveState = 'idle' | 'saving' | 'saved' | 'unsaved';

export interface SaveStatus {
  state: SaveState;
  /** Why the last save failed, when it did. */
  failure: ErrorCode | null;
}

type Send = (changes: AnswerChanges) => Promise<unknown>;

const RETRY_EVERY_MS = 15_000;

// Sending the same answers again cannot fix these, so the timer stops trying. The answers stay
// in the queue (and on screen) and go with Submit.
const NOT_WORTH_RETRYING: readonly ErrorCode[] = [
  'test_already_submitted',
  'test_time_over',
  'attempt_not_found',
  'invalid_answer',
  'not_signed_in',
  'demo_mode',
];

/**
 * Answers waiting to reach the server. Many students are on poor connections: an answer that
 * fails to save must never block the next question or be lost. Changes pile up here (a newer
 * answer to the same question replaces the older one), one request is in flight at a time,
 * and whatever fails goes back in the queue.
 *
 * A plain object rather than React state: it changes from event handlers, timers and finished
 * requests, and only its status is something to draw.
 */
class AnswerQueue {
  private pending: AnswerChanges = {};
  private sending = false;
  private stopped = false;
  private status: SaveStatus = { state: 'idle', failure: null };
  private readonly listeners = new Set<() => void>();

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  readonly getStatus = (): SaveStatus => this.status;

  hasPending(): boolean {
    return Object.keys(this.pending).length > 0;
  }

  /** Records a change and sends everything that is waiting. */
  add(changes: AnswerChanges, send: Send): void {
    this.pending = { ...this.pending, ...changes };
    // A new answer is a reason to try again, even after an error that stopped the timer.
    this.stopped = false;
    void this.flush(send);
  }

  /** The timer's turn: try again unless the last error said there is no point. */
  retry(send: Send): void {
    if (!this.stopped && this.hasPending()) void this.flush(send);
  }

  /** Sends what is waiting. Resolves true when nothing is left unsent. */
  async flush(send: Send): Promise<boolean> {
    if (this.sending) return false; // the request in flight picks up what was added after it
    let sent = false;
    while (this.hasPending()) {
      const batch = this.pending;
      this.pending = {};
      this.sending = true;
      this.setStatus({ state: 'saving', failure: null });
      try {
        await send(batch);
        sent = true;
      } catch (error) {
        // Answers chosen while the request was out win over the ones that failed.
        this.pending = { ...batch, ...this.pending };
        const code = toAppError(error).code;
        this.stopped = NOT_WORTH_RETRYING.includes(code);
        this.sending = false;
        this.setStatus({ state: 'unsaved', failure: code });
        return false;
      }
      this.sending = false;
    }
    if (sent) this.setStatus({ state: 'saved', failure: null });
    return true;
  }

  private setStatus(next: SaveStatus): void {
    this.status = next;
    for (const listener of this.listeners) listener();
  }
}

/**
 * Saves a student's answers while they take a test, quietly and without getting in their way:
 * `save` records a change and returns at once; failed saves are sent again with the next
 * answer and every fifteen seconds. Submit sends every answer once more, so nothing depends on
 * these saves succeeding.
 */
export function useAnswerSaver(attemptId: string) {
  const { mutateAsync } = useSaveAnswers(attemptId);
  const [queue] = useState(() => new AnswerQueue());
  const status = useSyncExternalStore(queue.subscribe, queue.getStatus, queue.getStatus);

  useEffect(() => {
    const timer = setInterval(() => queue.retry(mutateAsync), RETRY_EVERY_MS);
    return () => clearInterval(timer);
  }, [queue, mutateAsync]);

  return {
    status,
    save: (changes: AnswerChanges) => queue.add(changes, mutateAsync),
    /** One more try at sending what is waiting. Resolves true when everything is saved. */
    flush: () => queue.flush(mutateAsync),
    hasUnsaved: () => queue.hasPending(),
  };
}
