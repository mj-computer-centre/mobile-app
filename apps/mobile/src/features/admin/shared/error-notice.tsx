import { toAppError } from '@mcc/shared';

import { AppText, Notice } from '@/ui';

/**
 * What went wrong with a save, in the app's own words. Renders nothing while there is no
 * error, so screens can pass a mutation's `error` straight in. Announced by screen readers
 * when it appears.
 */
export function ErrorNotice({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <Notice tone="danger">
      <AppText accessibilityLiveRegion="polite">{toAppError(error).message}</AppText>
    </Notice>
  );
}
