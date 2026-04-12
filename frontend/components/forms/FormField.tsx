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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink-900" htmlFor={id}>
        {label}
      </label>

      <div
        className={`flex items-center gap-3 px-4 py-3 rounded border transition-colors ${
          hasError
            ? 'bg-white border-ink-300 focus-within:border-ink-500'
            : 'bg-white border-gray-300 focus-within:border-ink-500'
        }`}
      >
        <span className="text-ink-400 flex-shrink-0" aria-hidden="true">
          {leftIcon}
        </span>

        <input
          id={id}
          className="flex-1 bg-transparent text-ink-900 placeholder-ink-300 outline-none text-sm"
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : children ? `${id}-hint` : undefined
          }
          {...inputProps}
        />

        {/* Right slot: show/hide toggle OR checkmark */}
        {rightSlot ?? (isValid && !hasError && (
          <span className="text-ink-500 text-lg font-medium flex-shrink-0" aria-hidden="true">✓</span>
        ))}
      </div>

      {/* Below-input slot (e.g. strength bar) */}
      {children && <div id={`${id}-hint`} className="text-sm">{children}</div>}

      {/* Inline error */}
      {hasError && (
        <p id={`${id}-error`} className="text-sm text-ink-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default FormField;
