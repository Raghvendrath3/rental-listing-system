import type { Metadata } from 'next';
import LoginForm from '@/components/forms/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | RentalHub - Rental Listings Platform',
  description: 'Sign in to your RentalHub account to browse listings, manage properties, and connect with renters.',
  robots: 'noindex, nofollow',
};

export default function LoginPage() {
  return (
    <main className="page">
      <div className="card">
        <LoginForm />
      </div>
    </main>
  );
}
