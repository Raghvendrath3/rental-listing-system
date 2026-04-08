export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  feedback: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'bg-red-500',
      feedback: ['Password is required'],
    };
  }

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Add numbers');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  } else {
    feedback.push('Add special characters for extra security');
  }

  // Cap score at 4
  score = Math.min(score, 4);

  // Determine strength level
  const strengths = [
    { label: 'Very Weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-yellow-500' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-green-500' },
  ];

  const strengthLevel = strengths[score];

  return {
    score,
    label: strengthLevel.label,
    color: strengthLevel.color,
    feedback: feedback.length > 0 ? feedback : ['Great password!'],
  };
}
