'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Home, Shield, Users, ArrowRight, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/listings');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-up selection:bg-accent/20 selection:text-accent overflow-x-hidden">
      {/* Decorative Warm Accent Header Overlay */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Soft Warm Gradient Background Blob */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[350px] md:w-[600px] h-[350px] bg-gradient-to-tr from-secondary to-accent/5 rounded-full blur-[80px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-semibold uppercase tracking-wider mb-6">
          <Star className="h-4 w-4 fill-primary text-primary" />
          Reliable Rental Listings
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl leading-tight text-foreground">
          Find Your Next Home with{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RentalHub
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
          Search verified apartments, houses, studio rooms, and PGs across India. Enjoy secure interactions, direct inquiries, and robust safety rules.
        </p>

        {/* Search CTA Form */}
        <form onSubmit={handleSearch} className="w-full max-w-xl p-2 rounded-xl bg-card border border-border shadow-md flex flex-col sm:flex-row gap-2 mb-12 hover-lift">
          <div className="relative flex-grow flex items-center pl-3">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by city, area, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground pl-8 w-full h-12 text-[16px]"
            />
          </div>
          <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-sm border-0 h-12 px-6 rounded-lg">
            Search Properties
          </Button>
        </form>

        {/* Quick Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-b border-border/80 py-8 w-full max-w-4xl">
          <div>
            <div className="text-3xl font-bold text-primary">10K+</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Verified Homes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">5K+</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Happy Tenants</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">99%</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Satisfaction Score</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Safety Support</div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="bg-secondary/30 py-16 px-6 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3">
              Explore Our Core Features
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
              Simple tools built for tenants, property owners, and admin managers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1: Tenants */}
            <div className="p-6 rounded-xl border border-border bg-card hover-lift flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">For Renters</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Browse complete listing details, see owner contact information, and send direct inquiry messages.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    Detailed search and filter options
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    Safe owner profile displays
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    Quick inquiry submission flow
                  </li>
                </ul>
              </div>
              <Link href="/listings" className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline">
                Find properties <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Feature 2: Owners */}
            <div className="p-6 rounded-xl border border-border bg-card hover-lift flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Home className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">For Owners</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Register, submit verification details, draft/publish listings, and manage inquiries from interested renters.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    Simple become-owner requests
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    Easy listings builder and draft manager
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    Visual dashboard for inbox messages
                  </li>
                </ul>
              </div>
              <Link href="/become-owner" className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline">
                List your space <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Feature 3: Security */}
            <div className="p-6 rounded-xl border border-border bg-card hover-lift flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Secure Guard</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Every interaction is secured with standard RBAC validations and role-based policies.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    Edge and middleware authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    Row-level database security
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    Salted password hashes
                  </li>
                </ul>
              </div>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline">
                Read security info <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10 px-6 text-center text-sm text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} RentalHub. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/listings" className="hover:text-foreground transition-colors">Browse</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
