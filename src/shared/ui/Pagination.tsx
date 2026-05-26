interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
      >
        &lsaquo;
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-label={`Page ${String(page)}`}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`px-3 py-1.5 text-sm rounded border focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
            page === currentPage
              ? 'border-blue-700 bg-blue-700 text-white font-semibold'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
      >
        &rsaquo;
      </button>
    </nav>
  );
}
