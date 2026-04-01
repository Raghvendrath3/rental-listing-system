'use client';

import { useState, useEffect } from 'react';
import { signupUser } from '@/lib/auth';
import { validateSignupFields, isFormValid } from '@/lib/authValidation';
import { getPasswordStrength } from '@/lib/PasswordStrength';
import {
  FieldErrors,
  TouchedFields,
  PasswordStrength,
  SignupResponseData,
} from '@/types/auth.types';

interface UseSignupReturn {
  // State
  email: string;
  password: string;
  showPassword: boolean;
  errors: FieldErrors;
  touched: TouchedFields;
  loading: boolean;
  serverError: string;
  successData: SignupResponseData | null;
  strength: PasswordStrength;

  // Handlers
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  toggleShowPassword: () => void;
  handleBlur: (field: keyof TouchedFields) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useSignup(): UseSignupReturn {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successData, setSuccessData] = useState<SignupResponseData | null>(null);

  // Re-validate live only after a field has been touched
  useEffect(() => {
    if (touched.email || touched.password) {
      setErrors(validateSignupFields(email, password));
    }
  }, [email, password, touched]);

  const strength = getPasswordStrength(password);

  function handleBlur(field: keyof TouchedFields) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function toggleShowPassword() {
    setShowPassword((prev) => !prev);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');

    // Mark all fields as touched so errors show up
    setTouched({ email: true, password: true });

    const validationErrors = validateSignupFields(email, password);
    setErrors(validationErrors);
    if (!isFormValid(validationErrors)) return;

    setLoading(true);
    try {
      const response = await signupUser({ email, password });
      if (response.data) setSuccessData(response.data);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Unexpected error occurred.'
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    email,
    password,
    showPassword,
    errors,
    touched,
    loading,
    serverError,
    successData,
    strength,
    setEmail,
    setPassword,
    toggleShowPassword,
    handleBlur,
    handleSubmit,
  };
}