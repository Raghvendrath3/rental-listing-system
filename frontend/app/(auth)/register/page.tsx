'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/authStore';
import api, { getErrorMessage } from '@/lib/api';
import type { LoginResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Register the user
      await api.post('/auth/register', data);
      
      // Immediately login with the same credentials
      const loginResponse = await api.post<LoginResponse>('/auth/login', data);
      const { token, data: userData } = loginResponse.data;

      login(token, { id: userData.id, role: userData.role });
      toast.success('Account created successfully!');
      router.push('/listings');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-card border border-border/80 shadow-md rounded-xl hover-lift p-2 animate-fade-up">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
        <CardDescription className="text-sm">Enter your details to register</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-sm font-bold text-foreground/80">Full Name</Label>
            <Input
              id="full_name"
              type="text"
              placeholder="John Doe"
              disabled={isLoading}
              className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...registerField('full_name')}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive font-medium">{errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-bold text-foreground/80">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLoading}
              className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...registerField('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-bold text-foreground/80">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              disabled={isLoading}
              className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...registerField('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-destructive font-medium">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm font-bold text-foreground/80">Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Street Name, City"
              disabled={isLoading}
              className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...registerField('address')}
            />
            {errors.address && (
              <p className="text-sm text-destructive font-medium">{errors.address.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-bold text-foreground/80">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              disabled={isLoading}
              className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...registerField('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive font-medium">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground font-medium">
              At least 8 characters with uppercase, lowercase, number, and symbol
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 mt-2">
          <Button type="submit" className="w-full h-12 text-sm font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm border-0" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
          <p className="text-center text-sm text-muted-foreground font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
