import { RedirectIfAuthenticated } from '@/components/layout';
import { QueryProvider, AuthProvider } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <RedirectIfAuthenticated>
          <main className="flex min-h-screen items-center justify-center px-4">
            {children}
          </main>
          <Toaster position="top-right" />
        </RedirectIfAuthenticated>
      </AuthProvider>
    </QueryProvider>
  );
}
