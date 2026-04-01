import { FieldErrors } from '@/types/auth.types';

// Mirrors backend validateUser() exactly
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Password rules (same as backend):
 * - Min 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export function validateSignupFields(
  email: string,
  password: string
): FieldErrors {
  const errors: FieldErrors = {};

  // --- Email ---
  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Invalid email format';
  }

  // --- Password ---
  if (!password) {
    errors.password = 'Password is required';
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.password =
      'Min 8 chars · uppercase · lowercase · number · symbol';
  }

  return errors;
}

export function isFormValid(errors: FieldErrors): boolean {
  return Object.keys(errors).length === 0;
}