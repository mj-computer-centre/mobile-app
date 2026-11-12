import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

/** Web (admin website): always online and always editing, so nothing is persisted. */
export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> | null = null;
