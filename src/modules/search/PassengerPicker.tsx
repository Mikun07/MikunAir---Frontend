import { useRef, useState } from 'react';
import { useClickOutside, useToggle } from '@shared/hooks';

export interface PassengerCounts {
  adults: number;
  children: number;
}

interface PassengerPickerProps {
  value: PassengerCounts;
  onChange: (counts: PassengerCounts) => void;
  error?: string;
}

const MAX_TOTAL = 9;

function Counter({
  label,
  subLabel,
  value,
  onDecrement,
  onIncrement,
  decrementDisabled,
  incrementDisabled,
}: {
  label: string;
  subLabel: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementDisabled: boolean;
  incrementDisabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-xs text-white/40">{subLabel}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={decrementDisabled}
          aria-label={`Remove ${label.toLowerCase()}`}
          className="
            w-8 h-8 rounded-full border border-white/10 flex items-center justify-center
            text-sky-400 text-lg font-bold leading-none
            hover:bg-sky-500/20 hover:border-sky-500/40
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
          "
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-semibold text-white" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={incrementDisabled}
          aria-label={`Add ${label.toLowerCase()}`}
          className="
            w-8 h-8 rounded-full border border-white/10 flex items-center justify-center
            text-sky-400 text-lg font-bold leading-none
            hover:bg-sky-500/20 hover:border-sky-500/40
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
          "
        >
          +
        </button>
      </div>
    </div>
  );
}

export function PassengerPicker({ value, onChange, error }: PassengerPickerProps) {
  const [isOpen, , setOpen] = useToggle(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [childWarning, setChildWarning] = useState(false);

  useClickOutside(containerRef, () => setOpen(false));

  const total = value.adults + value.children;
  const atMax = total >= MAX_TOTAL;

  function changeAdults(delta: number) {
    const next = value.adults + delta;
    if (next < 1 || next > MAX_TOTAL) return;
    const newChildren = delta < 0 ? Math.min(value.children, next) : value.children;
    if (delta < 0 && value.children > next) {
      setChildWarning(true);
    } else {
      setChildWarning(false);
    }
    onChange({ adults: next, children: newChildren });
  }

  function changeChildren(delta: number) {
    const next = value.children + delta;
    if (next < 0 || next > MAX_TOTAL) return;
    if (next > 0 && value.adults === 0) return;
    setChildWarning(false);
    onChange({ adults: value.adults, children: next });
  }

  const label = [
    `${value.adults} adult${value.adults !== 1 ? 's' : ''}`,
    value.children > 0
      ? `${value.children} child${value.children !== 1 ? 'ren' : ''}`
      : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <span className="text-sm font-medium text-white/70">Passengers</span>

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Passengers: ${label}`}
        onClick={() => setOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl border bg-white/5 text-left text-white
          focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400
          transition-colors
          ${error ? 'border-red-400/60 bg-red-500/10' : 'border-white/10 hover:border-white/20'}
        `}
      >
        <svg className="h-4 w-4 text-white/30 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className="flex-1 text-white/70">{label}</span>
        <svg
          className={`h-4 w-4 text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Select passengers"
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-2xl shadow-black/40 px-4 py-1"
        >
          <Counter
            label="Adults"
            subLabel="Age 12+"
            value={value.adults}
            onDecrement={() => changeAdults(-1)}
            onIncrement={() => changeAdults(1)}
            decrementDisabled={value.adults <= 1}
            incrementDisabled={atMax}
          />
          <div className="border-t border-white/5" />
          <Counter
            label="Children"
            subLabel="Age 2–11"
            value={value.children}
            onDecrement={() => changeChildren(-1)}
            onIncrement={() => changeChildren(1)}
            decrementDisabled={value.children <= 0}
            incrementDisabled={atMax || value.adults === 0}
          />

          {childWarning && (
            <p role="alert" className="text-xs text-amber-400 pb-2 pt-1">
              Children reduced to match adult count — every child must travel with an adult.
            </p>
          )}

          <p className="text-xs text-white/30 pb-3 pt-1">
            Children must travel with at least one adult. Max {MAX_TOTAL} passengers.
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
