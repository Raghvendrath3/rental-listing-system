import type { Metadata } from 'next';
import Link from 'next/link';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import {ProtectedRoute} from '@/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Dashboard | RentalHub - Manage Your Rentals',
  description: 'Access your RentalHub dashboard to browse listings, manage properties, track inquiries, and update your profile.',
  robots: 'noindex, nofollow',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Sidebar - Hidden on mobile, shown on lg+ */}
      <div className="hidden lg:block w-64 bg-gray-900 text-white sticky top-0 h-screen">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
        {children}
        </div>
      </main>
      </div>

      {/* Mobile Navigation - Only shown on small screens */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
      <div className="flex justify-around">
        <Link href="/dashboard" className="flex-1 px-4 py-3 text-center text-white hover:bg-gray-800 text-sm">
        Browse
        </Link>
        <Link href="/dashboard/myListings" className="flex-1 px-4 py-3 text-center text-white hover:bg-gray-800 text-sm">
        My Listings
        </Link>
        <Link href="/dashboard/profile" className="flex-1 px-4 py-3 text-center text-white hover:bg-gray-800 text-sm">
        Profile
        </Link>
      </div>
      </nav>
    </ProtectedRoute>
  );
}
