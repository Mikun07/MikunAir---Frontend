import type { FlightOption } from '@shared/hooks';
import { formatPrice, formatDuration, formatDate, formatTime } from '@shared/utils';
import { Button, Badge } from '@shared/ui';

interface FlightCardProps {
  flight: FlightOption;
  selected?: boolean;
  onSelect: (flight: FlightOption) => void;
}

export function FlightCard({ flight, selected = false, onSelect }: Readonly<FlightCardProps>) {
  const { flightNumber, origin, destination, departureAt, arrivalAt, durationMinutes, farePerPassenger, availableSeats } = flight;

  return (
    <article
      aria-label={`Flight ${flightNumber} from ${origin.city} to ${destination.city}`}
      className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        selected ? 'border-blue-700 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">{flightNumber}</span>
          {availableSeats <= 5 && (
            <Badge variant="warning">{`${availableSeats} seat${availableSeats === 1 ? '' : 's'} left`}</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <div className="text-center">
            <p className="text-lg font-semibold">{formatTime(departureAt)}</p>
            <p className="text-xs text-gray-500">{origin.iataCode}</p>
          </div>
          <div className="flex-1 flex flex-col items-center text-xs text-gray-400">
            <span>{formatDuration(durationMinutes)}</span>
            <div className="w-full border-t border-gray-300 my-0.5" aria-hidden="true" />
            <span>Direct</span>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{formatTime(arrivalAt)}</p>
            <p className="text-xs text-gray-500">{destination.iataCode}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {origin.city} → {destination.city}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(departureAt)}</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <dl className="text-right text-sm">
          <div className="flex gap-2 text-gray-500">
            <dt>Base</dt>
            <dd>{formatPrice(farePerPassenger.baseFarePence)}</dd>
          </div>
          <div className="flex gap-2 text-gray-500">
            <dt>Taxes</dt>
            <dd>{formatPrice(farePerPassenger.taxesPence)}</dd>
          </div>
          <div className="flex gap-2 font-semibold text-gray-900">
            <dt>Total</dt>
            <dd>{formatPrice(farePerPassenger.totalPence)}</dd>
          </div>
        </dl>
        <Button
          variant={selected ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => onSelect(flight)}
          aria-pressed={selected}
        >
          {selected ? 'Selected' : 'Select'}
        </Button>
      </div>
    </article>
  );
}
