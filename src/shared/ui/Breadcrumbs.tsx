import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {index > 0 && (
                <span aria-hidden="true" className="text-gray-400">
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-gray-800 font-medium' : ''}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} className="hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
