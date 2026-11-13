'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { ApiResponse, AuthUser } from '@/types';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    let active = true;
    api.get<ApiResponse<AuthUser & { email: string; full_name?: string }>>('/auth/me')
      .then(({ data }) => {
        if (active) setUser({ id: data.data.id, role: data.data.role });
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setHydrated();
      });

    return () => {
      active = false;
    };
  }, [setHydrated, setUser]);

  return <>{children}</>;
}
