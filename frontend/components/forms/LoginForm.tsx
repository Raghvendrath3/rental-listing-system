'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { login } from '@/lib/auth';
import { parseToken } from '@/lib/tokenManager';
import FormField from '@/components/forms/FormField';

interface FormErrors {
  email?: string;
  password?: string;
}

interface TouchedFields {
  email: boolean;
  password: boolean;
}

export default function LoginForm() {
  const router = useRouter();
  const { login: authLogin, setError: setAuthError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({ email: false, password: false });
  const [serverError, setServerError] = useState<string | null>(null);
  
  const emailRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validateEmail = (value: string): string | undefined => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email address';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 1) return 'Password is required';
    return undefined;
  };

  const handleBlur = (field: keyof TouchedFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    if (field === 'email') {
      const error = validateEmail(email);
      setErrors((prev) => ({ ...prev, email: error }));
    } else if (field === 'password') {
      const error = validatePassword(password);
      setErrors((prev) => ({ ...prev, password: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setAuthError(null);

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      return;
    }

    setLoading(true);
    
    try {
      const response = await login({ email, password });
      
      if (response.token && response.user) {
        // Parse token to get userId and role
        const decoded = parseToken(response.token);
        
        if (decoded.isValid) {
          // Update auth context
          authLogin(response.token, {
            id: decoded.userId,
            email: response.user.email,
            role: decoded.role,
          });
          
          // Redirect based on role
          const dashboardPath = getDashboardPath(decoded.role);
          router.push(dashboardPath);
        } else {
          setServerError('Invalid token received. Please try again.');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setServerError(errorMessage);
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPath = (role: string): string => {
    switch (role) {
      case 'owner':
        return '/dashboard/myListings';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/dashboard';
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      {/* Header */}
      <div className="card-header">
        <div className="logo-mark" aria-hidden="true">◈</div>
        <h1 className="heading">Sign In</h1>
        <p className="subheading">Access your account</p>
      </div>

      {/* Server error banner */}
      {serverError && (
        <div className="server-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email field */}
        <FormField
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          ref={emailRef}
          leftIcon="@"
          error={errors.email}
          isTouched={touched.email}
          isValid={!errors.email && touched.email && email.length > 0}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
        />

        {/* Password field */}
        <FormField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Your password"
          autoComplete="current-password"
          value={password}
          leftIcon="▪"
          error={errors.password}
          isTouched={touched.password}
          isValid={!errors.password && touched.password && password.length > 0}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          rightSlot={
            <button
              type="button"
              className="toggle-btn"
              onClick={toggleShowPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '◑' : '◐'}
            </button>
          }
        />

        <button
          type="submit"
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-row">
              <span className="spinner" aria-hidden="true" />
              Signing in…
            </span>
          ) : (
            'Sign In →'
          )}
        </button>
      </form>

      <p className="footer-text">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="link">
          Create one
        </Link>
      </p>
    </>
  );
}
