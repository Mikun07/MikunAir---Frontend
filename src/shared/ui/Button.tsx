import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const base =
      'inline-flex items-center justify-center font-medium rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors';

    const variants: Record<string, string> = {
      primary:
        'bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-700 disabled:bg-blue-300',
      secondary:
        'bg-white text-blue-700 border border-blue-700 hover:bg-blue-50 focus-visible:ring-blue-700 disabled:opacity-50',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 disabled:bg-red-300',
      ghost:
        'bg-transparent text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-700 disabled:opacity-50',
    };

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <output aria-label="Loading">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </output>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
