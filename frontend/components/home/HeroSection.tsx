'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-white px-6 pt-20 pb-12 md:pt-32">
      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full mb-8">
          <span className="w-2 h-2 bg-ink-900 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-ink-600">Now accepting landlords and renters</span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-medium text-ink-900 mb-6 leading-tight">
          Find Your Perfect Rental
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-ink-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Browse thousands of verified listings or manage your properties with ease. Simple, transparent, and secure rental solutions.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-ink-900 text-white font-medium rounded border border-ink-900 hover:bg-ink-800 transition-colors text-center"
          >
            Get Started for Free
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-white text-ink-900 font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors text-center"
          >
            Browse Listings
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-ink-600 pt-8 border-t border-gray-300">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-ink-900">✓</span>
            <span>Verified Listings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-ink-900">✓</span>
            <span>Secure Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-ink-900">✓</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
