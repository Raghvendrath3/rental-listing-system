import { Navbar } from '@/components/layout';
import { QueryProvider, AuthProvider } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryProvider>
  );
}
