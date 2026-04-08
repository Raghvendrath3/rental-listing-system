interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingState({
  message = 'Loading...',
  fullScreen = false,
}: LoadingStateProps) {
  const containerClass = fullScreen ? 'fixed inset-0 flex items-center justify-center bg-white' : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="relative w-12 h-12 mb-4">
        {/* Spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
      </div>
      <p className="text-gray-600 text-sm font-medium">{message}</p>
    </div>
  );
}
