import type { InputHTMLAttributes} from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  dark?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', dark = false, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const describedBy = [error ? errorId : '', hint ? hintId : '']
      .filter(Boolean)
      .join(' ');

    const labelClass = dark ? 'text-sm font-medium text-white/80' : 'text-sm font-medium text-gray-700';
    const hintClass = dark ? 'text-xs text-white/40' : 'text-xs text-gray-500';
    const errorClass = dark ? 'text-xs text-red-400' : 'text-xs text-red-600';
    const inputClass = dark
      ? `border rounded px-3 py-2 text-sm text-white bg-white/10 placeholder:text-white/30
          focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
          ${error ? 'border-red-400' : 'border-white/20'}
          disabled:opacity-40`
      : `border rounded px-3 py-2 text-sm
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
          disabled:bg-gray-100 disabled:text-gray-500`;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className={labelClass}>
          {label}
          {props.required && (
            <span className={dark ? 'text-red-400 ml-1' : 'text-red-600 ml-1'} aria-hidden="true">
              *
            </span>
          )}
        </label>
        {hint && (
          <p id={hintId} className={hintClass}>
            {hint}
          </p>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? 'true' : undefined}
          className={`${inputClass} ${className}`}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className={errorClass}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
