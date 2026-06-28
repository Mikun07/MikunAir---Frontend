import type { ConnectingFlightOption } from '@shared/hooks';
import { formatPrice, formatDuration, formatDate, formatTime } from '@shared/utils';
import { Badge } from '@shared/ui';

interface ConnectingFlightCardProps {
  option: ConnectingFlightOption;
  selected?: boolean;
  onSelect: (option: ConnectingFlightOption) => void;
}

export function ConnectingFlightCard({
  option,
  selected = false,
  onSelect,
}: Readonly<ConnectingFlightCardProps>) {
  const { leg1, leg2, layoverMinutes, totalDurationMinutes, totalFarePerPassenger } = option;
  const minSeats = Math.min(leg1.availableSeats, leg2.availableSeats);

  return (
    <article
      aria-label={`Connecting flight ${leg1.flightNumber}+${leg2.flightNumber} from ${leg1.origin.city} to ${leg2.destination.city} via ${leg1.destination.city}`}
      className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        selected ? 'border-sky-500/60 bg-sky-500/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="flex-1 flex flex-col gap-3">
        {/* Leg 1 */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-sky-400 w-16 shrink-0">{leg1.flightNumber}</span>
          <div className="flex items-center gap-3 flex-1">
            <div className="text-center shrink-0">
              <p className="text-lg font-bold text-white leading-none">{formatTime(leg1.departureAt)}</p>
              <p className="text-xs text-white/40 mt-0.5">{leg1.origin.iataCode}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5 px-1">
              <p className="text-white/30 text-xs">{formatDuration(leg1.durationMinutes)}</p>
              <div className="w-full h-px bg-white/20" />
            </div>
            <div className="text-center shrink-0">
              <p className="text-lg font-bold text-white leading-none">{formatTime(leg1.arrivalAt)}</p>
              <p className="text-xs text-white/40 mt-0.5">{leg1.destination.iataCode}</p>
            </div>
          </div>
        </div>

        {/* Layover indicator */}
        <div className="flex items-center gap-2 pl-16">
          <div className="w-2 h-2 rounded-full border border-white/30 shrink-0" />
          <p className="text-xs text-white/30">
            {formatDuration(layoverMinutes)} layover in {leg1.destination.city}
          </p>
        </div>

        {/* Leg 2 */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-sky-400 w-16 shrink-0">{leg2.flightNumber}</span>
          <div className="flex items-center gap-3 flex-1">
            <div className="text-center shrink-0">
              <p className="text-lg font-bold text-white leading-none">{formatTime(leg2.departureAt)}</p>
              <p className="text-xs text-white/40 mt-0.5">{leg2.origin.iataCode}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5 px-1">
              <p className="text-white/30 text-xs">{formatDuration(leg2.durationMinutes)}</p>
              <div className="w-full h-px bg-white/20" />
            </div>
            <div className="text-center shrink-0">
              <p className="text-lg font-bold text-white leading-none">{formatTime(leg2.arrivalAt)}</p>
              <p className="text-xs text-white/40 mt-0.5">{leg2.destination.iataCode}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/25 pl-16">
          <span>{formatDate(leg1.departureAt)}</span>
          <span>·</span>
          <span>Total {formatDuration(totalDurationMinutes)}</span>
          <span>·</span>
          <span>1 stop</span>
          {minSeats <= 5 && (
            <Badge variant="warning">{`${minSeats} seat${minSeats === 1 ? '' : 's'} left`}</Badge>
          )}
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
        <dl className="text-right text-sm">
          <div className="flex gap-2 text-white/40">
            <dt>Base</dt>
            <dd>{formatPrice(totalFarePerPassenger.baseFarePence)}</dd>
          </div>
          <div className="flex gap-2 text-white/40">
            <dt>Taxes</dt>
            <dd>{formatPrice(totalFarePerPassenger.taxesPence)}</dd>
          </div>
          <div className="flex gap-2 font-bold text-white">
            <dt>Total</dt>
            <dd>{formatPrice(totalFarePerPassenger.totalPence)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => onSelect(option)}
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
