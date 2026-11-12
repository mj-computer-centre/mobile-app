import type { ConfirmOptions } from './confirm';

/** Web: the browser's confirm dialog (React Native's Alert does nothing on the web). */
export function confirmAction({ title, message }: ConfirmOptions): Promise<boolean> {
  return Promise.resolve(window.confirm(`${title}\n\n${message}`));
}

export function showMessage(title: string, message: string): void {
  window.alert(`${title}\n\n${message}`);
}
