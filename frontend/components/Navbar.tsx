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
    <nav className="w-full flex items-center justify-between p-4 bg-gray-900 text-white">
      {/* Logo / Home Link */}
      <div className="text-xl font-bold">
        <Link href="/" className="hover:text-gray-300">
          RentalHub
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        {/* <SmartSearchBox placeholder="Search properties..." /> */}
        
        {/* Auth Section */}
        <div className="flex items-center space-x-2 ml-4">
          {!loading && isAuthenticated && user ? (
            <>
              {/* User info */}
              <div className="px-3 py-2 text-sm">
                <div className="text-gray-300">{user.email}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
              </div>
              
              {/* Dashboard link based on role */}
              {user.role === 'owner' ? (
                <Link
                  href="/dashboard/myListings"
                  className="px-4 py-2 text-sm font-medium text-white hover:text-gray-200 transition-colors"
                >
                  My Listings
                </Link>
              ) : user.role === 'admin' ? (
                <Link
                  href="/dashboard/admin"
                  className="px-4 py-2 text-sm font-medium text-white hover:text-gray-200 transition-colors"
                >
                  Admin
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white hover:text-gray-200 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-white hover:text-gray-200 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
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
