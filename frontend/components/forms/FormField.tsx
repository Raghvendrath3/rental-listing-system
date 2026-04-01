import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  isTouched: boolean;
  isValid: boolean;
  leftIcon: ReactNode;
  rightSlot?: ReactNode;
  children?: ReactNode;   // slot below input (e.g. strength bar)
}

const FormField = forwardRef<HTMLInputElement, Props>(function FormField({
  id,
  label,
  error,
  isTouched,
  isValid,
  leftIcon,
  rightSlot,
  children,
  ...inputProps
}: Props, ref) {
  const hasError = !!error && isTouched;

  return (
    <div className="field-group">
      <label className="label" htmlFor={id}>
        {label}
      </label>

      <div
        className={[
          'input-wrapper',
          hasError ? 'input-error' : '',
          isValid && !hasError ? 'input-valid' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="input-icon" aria-hidden="true">
          {leftIcon}
        </span>

        <input
          id={id}
          className="input"
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : children ? `${id}-hint` : undefined
          }
          {...inputProps}
        />

        {/* Right slot: show/hide toggle OR checkmark */}
        {rightSlot ?? (isValid && !hasError && (
          <span className="check-icon" aria-hidden="true">✓</span>
        ))}
      </div>

      {/* Below-input slot (e.g. strength bar) */}
      {children && <div id={`${id}-hint`}>{children}</div>}

      {/* Inline error */}
      {hasError && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default FormField;