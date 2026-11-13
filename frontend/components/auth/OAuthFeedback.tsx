'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const ERROR_MESSAGES: Record<string, string> = {
  account_exists:
    'An account already exists for the Google email you selected. Sign in with that account’s email and password. For your security, Google accounts are not linked automatically.',
  denied: 'Google sign-in was cancelled. You can try again whenever you are ready.',
  state: 'We could not verify this sign-in request. It may have expired; please start Google sign-in again.',
  unavailable: 'Google sign-in is currently unavailable. Try again later or sign in with your email and password.',
  unverified_email:
    'Google could not confirm that email address. Choose a Google account with a verified email and try again.',
  provider: 'Google could not complete sign-in. Please try again.',
  failed: 'We could not complete Google sign-in. Please try again; if the problem continues, contact support.',
};

interface OAuthFeedbackProps {
  context: 'login' | 'register';
}

export function OAuthFeedback({ context }: OAuthFeedbackProps) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const errorCode = url.searchParams.get('oauth_error');
    if (!errorCode) return;

    setMessage(ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.failed);
    url.searchParams.delete('oauth_error');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-foreground"
    >
      <p>{message}</p>
      {context === 'register' && (
        <Link href="/login" className="mt-2 inline-block font-semibold text-primary underline">
          Go to sign in
        </Link>
      )}
    </div>
  );
}
