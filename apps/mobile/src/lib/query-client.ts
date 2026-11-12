import { toAppError } from '@mcc/shared';
import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Course content changes a few times a week; a minute of freshness saves data on
        // slow connections without making new lessons feel late.
        staleTime: 60_000,
        gcTime: 30 * 60_000,
        // Retry only dropped connections; a permission error will not fix itself.
        retry: (failureCount, error) => failureCount < 2 && toAppError(error).code === 'network',
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
