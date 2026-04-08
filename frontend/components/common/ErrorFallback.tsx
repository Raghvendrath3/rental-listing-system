interface ErrorFallbackProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  details?: string;
}

export default function ErrorFallback({
  title = 'Something went wrong',
  message,
  onRetry,
  details,
}: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-4">{message}</p>
          {details && (
            <p className="text-sm text-gray-500 mb-6 p-3 bg-gray-100 rounded font-mono">
              {details}
            </p>
          )}
          <div className="flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => (window.location.href = '/')}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
