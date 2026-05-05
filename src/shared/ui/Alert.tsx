import { ReactNode } from 'react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onRetry?: () => void;
}

export function Alert({ variant = 'info', title, children, onRetry }: AlertProps) {
  const styles: Record<string, string> = {
    info: 'bg-blue-50 border-blue-300 text-blue-800',
    success: 'bg-green-50 border-green-300 text-green-800',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    error: 'bg-red-50 border-red-300 text-red-800',
  };

  const roles: Record<string, string> = {
    info: 'status',
    success: 'status',
    warning: 'alert',
    error: 'alert',
  };

  return (
    <div role={roles[variant]} className={`border rounded-lg p-4 ${styles[variant]}`}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <p className="text-sm">{children}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-current rounded"
        >
          Try again
        </button>
      )}
    </div>
  );
}
