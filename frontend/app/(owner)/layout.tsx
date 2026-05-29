import { Navbar, ProtectedRoute } from '@/components/layout';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </ProtectedRoute>
  );
}
