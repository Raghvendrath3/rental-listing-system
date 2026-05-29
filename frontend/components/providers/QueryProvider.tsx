'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time for queries
            staleTime: 30 * 1000, // 30 seconds
            // Retry failed queries once
            retry: 1,
            // Don't refetch on window focus for this app
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Don't retry mutations
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
