'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated, selectUserRole } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, LayoutDashboard, Users, Shield, LogOut, LogIn, UserPlus } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const userRole = useAuthStore(selectUserRole);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Navigation items based on role
  const getNavItems = () => {
    const items: { href: string; label: string; icon: React.ReactNode }[] = [
      { href: '/listings', label: 'Listings', icon: <Home className="h-4 w-4" /> },
    ];

    if (!isAuthenticated) {
      return items;
    }

    if (userRole === 'user') {
      items.push({ href: '/owner-status', label: 'Owner Status', icon: <Users className="h-4 w-4" /> });
    }

    if (userRole === 'owner') {
      items.push({ href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> });
      items.push({ href: '/owner-status', label: 'Owner Status', icon: <Users className="h-4 w-4" /> });
    }

    if (userRole === 'admin') {
      items.push({ href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> });
      items.push({ href: '/admin/dashboard', label: 'Admin', icon: <Shield className="h-4 w-4" /> });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/listings" className="text-lg font-semibold text-foreground">
            Rentals
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href || (item.href !== '/listings' && pathname.startsWith(item.href))
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
