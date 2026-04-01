'use client';

import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { useSignup } from '@/hooks/useSignup';
import FormField from '@/components/forms/FormField';
import PasswordStrengthBar from '@/components/forms/PasswordStrengthBar';
import SignupSuccess from '@/components/forms/SignupSuccess';

export default function SignupForm() {
  const {
    email, password, showPassword,
    errors, touched, loading,
    serverError, successData, strength,
    setEmail, setPassword,
    toggleShowPassword, handleBlur, handleSubmit,
  } = useSignup();

  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => { emailRef.current?.focus(); }, []);

  if (successData) return <SignupSuccess data={successData} />;

  return (
    <>
      {/* Header */}
      <div className="card-header">
        <div className="logo-mark" aria-hidden="true">◈</div>
        <h1 className="heading">Create Account</h1>
        <p className="subheading">Register to get started</p>
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
          placeholder="Min 8 chars, mixed case + symbol"
          autoComplete="new-password"
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
        >
          {/* Strength bar lives inside the field slot */}
          {password && <PasswordStrengthBar strength={strength} />}
        </FormField>

        <button
          type="submit"
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-row">
              <span className="spinner" aria-hidden="true" />
              Creating Account…
            </span>
          ) : (
            'Create Account →'
          )}
        </button>
      </form>

      <p className="footer-text">
        Already have an account?{' '}
        <Link href="/auth/login" className="link">
          Sign in
        </Link>
      </p>
    </>
  );
}