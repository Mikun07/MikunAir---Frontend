import type { ReactNode } from 'react';

interface BannerProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'promo';
  onDismiss?: () => void;
}

const VARIANTS: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  promo: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent',
};

export function Banner({ children, variant = 'info', onDismiss }: BannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-between gap-3 px-4 py-3 border rounded-lg text-sm font-medium ${VARIANTS[variant]}`}
    >
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss banner"
          className="ml-auto shrink-0 rounded p-0.5 hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
