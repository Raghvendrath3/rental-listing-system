'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiredRole?: 'user' | 'owner' | 'admin';
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const baseNavItems: NavItem[] = [
    { label: 'Browse Listings', href: '/dashboard', icon: '🏠' },
  ];

  const ownerNavItems: NavItem[] = [
    { label: 'My Listings', href: '/dashboard/myListings', icon: '📋', requiredRole: 'owner' },
    { label: 'Create Listing', href: '/dashboard/myListings/new', icon: '➕', requiredRole: 'owner' },
  ];

  const becomeOwnerNavItems: NavItem[] = [
    { label: 'Become an Owner', href: '/dashboard/become-owner', icon: '⭐', requiredRole: 'user' },
  ];

  const adminNavItems: NavItem[] = [
    { label: 'Admin Dashboard', href: '/dashboard/admin', icon: '⚙️', requiredRole: 'admin' },
    { label: 'User Management', href: '/dashboard/admin/users', icon: '👥', requiredRole: 'admin' },
  ];

  const profileNavItems: NavItem[] = [
    { label: 'Profile Settings', href: '/dashboard/profile', icon: '👤' },
  ];

  let allNavItems = [...baseNavItems, ...profileNavItems];

  if (user?.role === 'owner') {
    allNavItems = [...baseNavItems, ...ownerNavItems, ...profileNavItems];
  } else if (user?.role === 'admin') {
    allNavItems = [...baseNavItems, ...adminNavItems, ...profileNavItems];
  } else if (user?.role === 'user') {
    allNavItems = [...baseNavItems, ...becomeOwnerNavItems, ...profileNavItems];
  }

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 bg-white border-r border-gray-300 min-h-screen flex flex-col sticky top-0">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-300 space-y-2">
        <h2 className="text-lg font-semibold text-ink-900">Dashboard</h2>
        {user && (
          <p className="text-sm text-ink-500 truncate">{user.email}</p>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {allNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
              isActive(item.href)
                ? 'bg-ink-900 text-white'
                : 'text-ink-600 hover:bg-gray-100 hover:text-ink-900'
            }`}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-300">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 px-4 py-3 rounded text-ink-600 hover:bg-gray-100 hover:text-ink-900 transition-colors"
        >
          <span className="text-lg flex-shrink-0">⚙️</span>
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
