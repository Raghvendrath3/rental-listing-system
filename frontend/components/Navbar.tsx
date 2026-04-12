'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-gray-300">
      {/* Logo / Home Link */}
      <div className="text-lg font-semibold">
        <Link href="/" className="text-ink-900 hover:text-ink-700 transition-colors">
          RentalHub
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors">
          Home
        </Link>
        
        {/* Auth Section */}
        <div className="flex items-center gap-4 ml-6 pl-6 border-l border-gray-300">
          {!loading && isAuthenticated && user ? (
            <>
              {/* User info */}
              <div className="text-sm">
                <div className="font-medium text-ink-900">{user.email}</div>
                <div className="text-xs text-ink-500 capitalize">{user.role}</div>
              </div>
              
              {/* Dashboard link based on role */}
              {user.role === 'owner' ? (
                <Link
                  href="/dashboard/myListings"
                  className="px-4 py-2 text-sm font-medium text-ink-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  My Listings
                </Link>
              ) : user.role === 'admin' ? (
                <Link
                  href="/dashboard/admin"
                  className="px-4 py-2 text-sm font-medium text-ink-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Admin
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-ink-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium bg-ink-900 text-white rounded border border-ink-900 hover:bg-ink-800 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-ink-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium bg-ink-900 text-white rounded border border-ink-900 hover:bg-ink-800 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
