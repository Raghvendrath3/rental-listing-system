'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated, selectUserRole } from '@/stores/authStore';
import { Spinner } from '@/components/ui/spinner';

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
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

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
  }, [isHydrated, isAuthenticated, userRole, pathname, router]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show spinner while redirecting
  if (isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
