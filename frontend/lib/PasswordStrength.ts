import { PasswordStrength } from '@/types/auth.types';

const LEVELS: PasswordStrength[] = [
  { score: 0, label: '',            color: '' },
  { score: 1, label: 'Very Weak',   color: '#ef4444' },
  { score: 2, label: 'Weak',        color: '#f97316' },
  { score: 3, label: 'Fair',        color: '#eab308' },
  { score: 4, label: 'Strong',      color: '#84cc16' },
  { score: 5, label: 'Very Strong', color: '#22c55e' },
];

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return LEVELS[0];

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password))  score++;
  if (/[A-Z]/.test(password))  score++;
  if (/\d/.test(password))     score++;
  if (/[\W_]/.test(password))  score++;

  return LEVELS[score] ?? LEVELS[0];
}