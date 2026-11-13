import { Navbar, ProtectedRoute } from '@/components/layout';
import { QueryProvider, AuthProvider } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

export const dynamic = 'force-dynamic';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <Toaster position="top-right" />
        </ProtectedRoute>
      </AuthProvider>
    </QueryProvider>
  );
}
