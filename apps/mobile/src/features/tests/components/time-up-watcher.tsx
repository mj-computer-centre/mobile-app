import { timeLeftMs } from '@mcc/shared';
import { useEffect, useRef } from 'react';

import { useServerNow } from '../hooks';

/**
 * Tells the test screen, once, when the student's time has run out. It draws nothing. Keeping
 * the ticking here means the screen with the question on it does not re-render every second.
 * It also fires straight away when the screen is opened after the deadline has passed.
 */
export function TimeUpWatcher({
  deadlineAt,
  clockOffsetMs,
  onTimeUp,
}: {
  deadlineAt: string;
  clockOffsetMs: number;
  onTimeUp: () => void;
}) {
  const now = useServerNow(clockOffsetMs, 1000);
  const isUp = timeLeftMs({ deadlineAt }, now) === 0;
  const told = useRef(false);

  useEffect(() => {
    if (isUp && !told.current) {
      told.current = true;
      onTimeUp();
    }
  }, [isUp, onTimeUp]);

  return null;
}
