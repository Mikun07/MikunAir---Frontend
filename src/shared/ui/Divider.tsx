interface DividerProps {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({ label, orientation = 'horizontal' }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className="w-px self-stretch bg-gray-200" role="separator" aria-orientation="vertical" />;
  }

  if (label) {
    return (
      <div className="flex items-center gap-3" role="separator">
        <div className="flex-1 border-t border-gray-200" aria-hidden="true" />
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
        <div className="flex-1 border-t border-gray-200" aria-hidden="true" />
      </div>
    );
  }

  return <hr className="border-gray-200" />;
}
