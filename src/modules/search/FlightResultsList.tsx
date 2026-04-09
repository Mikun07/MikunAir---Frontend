import { FlightOption } from '@shared/hooks';
import { Spinner } from '@shared/ui';
import { FlightCard } from './FlightCard';

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
  return (
    <section aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`}>
      <h2
        id={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`}
        className="text-lg font-semibold text-gray-800 mb-3"
      >
        {title}
      </h2>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner label={`Loading ${title.toLowerCase()}…`} />
        </div>
      )}

      {!isLoading && flights.length === 0 && (
        <p className="text-gray-500 py-4">No flights found for this route and date.</p>
      )}

      {!isLoading && flights.length > 0 && (
        <ul className="flex flex-col gap-3" role="list">
          {flights.map((flight) => (
            <li key={flight.id}>
              <FlightCard
                flight={flight}
                selected={flight.id === selectedId}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
