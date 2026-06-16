interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const HEIGHTS: Record<string, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const COLOURS: Record<string, string> = {
  default: 'bg-blue-700',
  success: 'bg-green-600',
  warning: 'bg-amber-500',
  danger: 'bg-red-600',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showLabel = false,
  size = 'md',
  variant = 'default',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="flex flex-col gap-1 w-full">
      {(label || showLabel) && (
        <div className="flex justify-between text-xs text-gray-600">
          {label && <span>{label}</span>}
          {showLabel && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className={`w-full rounded-full bg-gray-200 overflow-hidden ${HEIGHTS[size]}`}
      >
        <div
          className={`${HEIGHTS[size]} rounded-full transition-all duration-300 ${COLOURS[variant]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
