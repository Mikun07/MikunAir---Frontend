import type { FlightOption } from '@shared/hooks';
import { usePagination } from '@shared/hooks';
import { Spinner, Pagination } from '@shared/ui';
import { FlightCard } from './FlightCard';

const PAGE_SIZE = 5;

interface FlightResultsListProps {
  title: string;
  flights: FlightOption[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (flight: FlightOption) => void;
}

export function FlightResultsList({
  title,
  flights,
  isLoading,
  selectedId,
  onSelect,
}: FlightResultsListProps) {
  const headingId = `${title.toLowerCase().replace(/\s+/g, '-')}-heading`;
  const { currentPage, totalPages, pageItems, goToPage } = usePagination(flights, PAGE_SIZE);

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
        {title}
      </h2>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner label={`Loading ${title.toLowerCase()}…`} />
        </div>
      )}

      {!isLoading && flights.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-10 text-center">
          <p className="text-white/40 text-sm">No flights found for this route and date.</p>
          <p className="text-white/25 text-xs mt-1">Try adjusting your dates or destination.</p>
        </div>
      )}

      {!isLoading && flights.length > 0 && (
        <>
          <p className="sr-only" aria-live="polite">
            {flights.length} {flights.length === 1 ? 'flight' : 'flights'} found
          </p>
          <ul className="flex flex-col gap-3" role="list">
            {pageItems.map((flight) => (
              <li key={flight.id}>
                <FlightCard
                  flight={flight}
                  selected={flight.id === selectedId}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
