import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { Query } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import Storage from 'expo-sqlite/kv-store';

import { devBypass } from './dev-bypass';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Native: keeps fetched course content on the phone, so a student can reopen a course and its
 * cached PDFs without internet (poor connectivity is the norm for many students). Only catalog
 * queries are kept; admin data and personal data are never written to disk. Off in dev-bypass
 * mode, so demo data never lingers into a real session.
 */
export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> | null = devBypass
  ? null
  : {
      persister: createAsyncStoragePersister({ storage: Storage, key: 'mcc-query-cache' }),
      maxAge: ONE_WEEK_MS,
      // Bump when cached shapes change, so old caches are dropped instead of misread.
      buster: 'catalog-v1',
      dehydrateOptions: {
        shouldDehydrateQuery: (query: Query) =>
          query.queryKey[0] === 'catalog' && query.state.status === 'success',
      },
    };
