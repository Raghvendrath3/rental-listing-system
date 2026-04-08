'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'owner' | 'admin';
}

/**
 * Wrapper component to protect routes that require authentication
 * Redirects to login if not authenticated
 * Optionally checks for specific roles
 */
export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const [mounted] = useState(true);

  useEffect(() => {
    if (!mounted || loading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      const dashboardPath = getDashboardPath(user?.role || 'user');
      router.push(dashboardPath);
      return;
    }
  }, [isAuthenticated, user, loading, requiredRole, router, mounted]);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}

function getDashboardPath(role: string): string {
  switch (role) {
    case 'owner':
      return '/dashboard/myListings';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/dashboard';
  }
}
