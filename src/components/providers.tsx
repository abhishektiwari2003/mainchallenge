'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * App-wide client providers (React Query).
 *
 * PERF: a single QueryClient is created once (lazy state initializer) with a
 * 60s `staleTime` and `refetchOnWindowFocus: false` so cached journal/insight
 * queries are reused and we avoid refetch storms / redundant recomputation.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // PERF: cache query results for 60s to minimize refetches.
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
