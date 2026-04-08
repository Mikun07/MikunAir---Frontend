interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  children: string;
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  const styles: Record<string, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
