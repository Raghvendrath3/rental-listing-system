import { RedirectIfAuthenticated } from '@/components/layout';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RedirectIfAuthenticated>
      <main className="flex min-h-screen items-center justify-center px-4">
        {children}
      </main>
    </RedirectIfAuthenticated>
  );
}
