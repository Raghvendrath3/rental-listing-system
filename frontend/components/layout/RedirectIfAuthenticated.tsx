'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated, selectUserRole } from '@/stores/authStore';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

/**
 * Redirects authenticated users away from auth pages (login/register).
 * 
 * Redirect rules:
 * - Authenticated user visits /login or /register →
 *   - user → /listings
 *   - owner → /dashboard
 *   - admin → /admin/dashboard
 */
export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const userRole = useAuthStore(selectUserRole);

  useEffect(() => {
    if (isAuthenticated && userRole) {
      // Redirect authenticated users based on their role
      if (pathname === '/login' || pathname === '/register') {
        switch (userRole) {
          case 'admin':
            router.replace('/admin/dashboard');
            break;
          case 'owner':
            router.replace('/dashboard');
            break;
          default:
            router.replace('/listings');
        }
      }
    }
  }, [isAuthenticated, userRole, pathname, router]);

  // Keep the auth page rendered while storage hydrates and redirect after it does.
  if (isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8" aria-busy="true" aria-label="Redirecting">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return <>{children}</>;
}
