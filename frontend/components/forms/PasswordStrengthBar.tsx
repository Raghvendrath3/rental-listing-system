import { PasswordStrength } from '@/types/auth.types';

interface Props {
  strength: PasswordStrength;
}

export default function PasswordStrengthBar({ strength }: Props) {
  if (!strength.label) return null;

  return (
    <div
      id="pw-strength"
      className="strength-row"
      aria-live="polite"
      aria-label={`Password strength: ${strength.label}`}
    >
      <div className="strength-bar-track">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="strength-segment"
            style={{
              backgroundColor: i <= strength.score ? strength.color : '#222',
              opacity: i <= strength.score ? 1 : 0.4,
            }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color: strength.color }}>
        {strength.label}
      </span>
    </div>
  );
}