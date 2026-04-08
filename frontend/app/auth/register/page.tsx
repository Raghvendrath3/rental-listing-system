
import type { Metadata } from 'next';
import SignupForm from '@/components/forms/SignupForm';
 
export const metadata: Metadata = {
  title: 'Create Account | RentalHub - Free Rental Listings',
  description: 'Sign up for free to start listing properties or browsing rental listings on RentalHub. Join thousands of verified users today.',
  robots: 'noindex, nofollow',
};
 
export default function RegisterPage() {
  return (
    <main className="page">
      <div className="card">
        <SignupForm />
      </div>
    </main>
  );
}
