import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import HowItWorks from '@/components/home/HowItWorks';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';
import CTASection from '@/components/home/CTASection';

export const metadata: Metadata = {
  title: 'RentalHub - Find Your Perfect Rental',
  description: 'Browse thousands of verified rental listings or manage your properties with ease. Simple, transparent, and secure rental solutions.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rentalhub.com',
    siteName: 'RentalHub',
    title: 'RentalHub - Find Your Perfect Rental',
    description: 'Browse thousands of verified rental listings or manage your properties with ease.',
    images: [
      {
        url: 'https://rentalhub.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
