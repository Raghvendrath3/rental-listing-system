
import type { Metadata } from 'next';
import SignupForm from '@/components/forms/SignupForm';
 
export const metadata: Metadata = {
  title: 'Create Account | RentalListingSystem',
  description: 'Sign up to start listing or renting properties.',
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