'use client';

import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook to access authentication state and methods
 * Must be used within AuthProvider
 */
export function useAuth() {
  return useAuthContext();
}
