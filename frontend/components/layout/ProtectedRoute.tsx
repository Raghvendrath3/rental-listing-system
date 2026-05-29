'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated, selectUserRole } from '@/stores/authStore';
import { Spinner } from '@/components/ui/spinner';
import type { Role } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

/**
 * ProtectedRoute component that handles authentication and role-based access.
 * 
 * Redirect rules from the backend documentation:
 * - Unauthenticated user visits any protected route → /login
 * - role: user visits /dashboard or /dashboard/* → /listings
 * - role: user visits /admin/* → /listings
 * - role: owner visits /admin/* → /dashboard
 * - role: owner visits /become-owner → /owner-status
 * - role: admin visits /become-owner → /listings
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const userRole = useAuthStore(selectUserRole);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    // Wait for auth hydration
    if (!isHydrated) return;

    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // If allowedRoles is specified, check if user has the required role
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      // Apply role-specific redirect rules
      if (userRole === 'user') {
        // Users cannot access owner dashboard or admin routes
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
          router.replace('/listings');
        }
      } else if (userRole === 'owner') {
        // Owners cannot access admin routes
        if (pathname.startsWith('/admin')) {
          router.replace('/dashboard');
        }
        // Owners visiting become-owner should go to owner-status
        if (pathname === '/become-owner') {
          router.replace('/owner-status');
        }
      } else if (userRole === 'admin') {
        // Admins visiting become-owner should go to listings
        if (pathname === '/become-owner') {
          router.replace('/listings');
        }
      }
    }
  }, [isHydrated, isAuthenticated, userRole, allowedRoles, pathname, router]);

  // Show spinner while checking authentication
  if (!isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't render children if not authenticated (they'll be redirected)
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't render children if user doesn't have required role (they'll be redirected)
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
