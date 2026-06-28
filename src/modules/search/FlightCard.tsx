import type { FlightOption } from '@shared/hooks';
import { formatPrice, formatDuration, formatDate, formatTime } from '@shared/utils';
import { Badge } from '@shared/ui';

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
      className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        selected
          ? 'border-sky-500/60 bg-sky-500/10'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-sm font-bold text-sky-400">{flightNumber}</span>
          {availableSeats <= 5 && (
            <Badge variant="warning">{`${availableSeats} seat${availableSeats === 1 ? '' : 's'} left`}</Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center shrink-0">
            <p className="text-xl font-bold text-white leading-none">{formatTime(departureAt)}</p>
            <p className="text-xs text-white/40 mt-0.5">{origin.iataCode}</p>
            <p className="text-xs text-white/30">{origin.city}</p>
          </div>

          <div className="flex-1 flex flex-col items-center gap-0.5 px-2">
            <p className="text-white/30 text-xs">{formatDuration(durationMinutes)}</p>
            <div className="w-full flex items-center gap-1">
              <div className="h-px flex-1 bg-white/20" />
              <svg className="h-3 w-3 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <div className="h-px flex-1 bg-white/20" />
            </div>
            <p className="text-white/30 text-xs">Direct</p>
          </div>

          <div className="text-center shrink-0">
            <p className="text-xl font-bold text-white leading-none">{formatTime(arrivalAt)}</p>
            <p className="text-xs text-white/40 mt-0.5">{destination.iataCode}</p>
            <p className="text-xs text-white/30">{destination.city}</p>
          </div>
        </div>

        <p className="text-xs text-white/30 mt-2">{formatDate(departureAt)}</p>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
        <dl className="text-right text-sm">
          <div className="flex gap-2 text-white/40">
            <dt>Base</dt>
            <dd>{formatPrice(farePerPassenger.baseFarePence)}</dd>
          </div>
          <div className="flex gap-2 text-white/40">
            <dt>Taxes</dt>
            <dd>{formatPrice(farePerPassenger.taxesPence)}</dd>
          </div>
          <div className="flex gap-2 font-bold text-white">
            <dt>Total</dt>
            <dd>{formatPrice(farePerPassenger.totalPence)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => onSelect(flight)}
          aria-pressed={selected}
          className={`shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
            selected
              ? 'bg-sky-500 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
          }`}
        >
          {selected ? 'Selected' : 'Select'}
        </button>
      </div>
    </article>
  );
}
