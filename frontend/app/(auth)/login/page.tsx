'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/authStore';
import { loginUser } from '@/lib/services';
import { getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import { OAuthFeedback } from '@/components/auth/OAuthFeedback';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      const { data: userData } = response;
      login({ id: userData.id, role: userData.role });
      toast.success('Login successful!');

      // Redirect based on role
      if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (userData.role === 'owner') {
        router.push('/dashboard');
      } else {
        router.push('/listings');
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const isLoading = loginMutation.isPending;

  return (
    <Card className="w-full max-w-sm bg-card border border-border/80 shadow-md rounded-xl hover-lift p-2">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
        <CardDescription className="text-sm">Sign in to your account to continue</CardDescription>
      </CardHeader>
      <div className="px-6">
        <OAuthFeedback context="login" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold text-foreground/80">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLoading}
              className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-bold text-foreground/80">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive font-medium">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 mt-2">
          <Button type="submit" className="w-full h-12 text-sm font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm border-0" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <div className="w-full space-y-4">
            <div className="text-center text-xs text-muted-foreground">or</div>
            <GoogleOAuthButton />
          </div>
          <p className="text-center text-sm text-muted-foreground font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-bold">
              Register here
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
