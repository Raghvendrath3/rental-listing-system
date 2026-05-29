'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Spinner } from '@/components/ui/spinner';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Show loading spinner while hydrating from localStorage
  // This prevents flash of unauthenticated content
  if (!isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
