'use client';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorAlert({ message, onRetry, onDismiss }: ErrorAlertProps) {
  return (
    <div className="bg-white border border-ink-300 rounded p-4 mb-6">
      <div className="flex items-start gap-4">
        <span className="text-ink-600 text-lg font-bold flex-shrink-0">⚠</span>
        <div className="flex-1">
          <h3 className="text-ink-900 font-semibold mb-1">Error</h3>
          <p className="text-ink-600 text-sm">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="flex gap-3 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium text-ink-900 hover:text-ink-700 border-b border-ink-300"
                >
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium text-ink-900 hover:text-ink-700 border-b border-ink-300"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
