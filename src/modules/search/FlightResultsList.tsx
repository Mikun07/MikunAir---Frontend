import type { FlightOption } from '@shared/hooks';
import { usePagination } from '@shared/hooks';
import { Spinner, Pagination, EmptyState } from '@shared/ui';
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
      <h2 id={headingId} className="text-lg font-semibold text-gray-800 mb-3">
        {title}
      </h2>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner label={`Loading ${title.toLowerCase()}…`} />
        </div>
      )}

      {!isLoading && flights.length === 0 && (
        <EmptyState
          title="No flights found"
          description="Try adjusting your dates, origin or destination."
        />
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
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        </>
      )}
    </section>
  );
}
