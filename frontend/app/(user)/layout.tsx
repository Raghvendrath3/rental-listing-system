import { Navbar, ProtectedRoute } from '@/components/layout';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['user', 'owner', 'admin']}>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </ProtectedRoute>
  );
}
