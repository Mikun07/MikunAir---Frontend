import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@shared/api';
import { useAuth } from '@modules/auth/AuthContext';
import { useWindowTitle } from '@shared/hooks';
import { Spinner, Alert, Badge } from '@shared/ui';
import { formatPrice } from '@shared/utils';

interface FlightHistorySegment {
  flightId: string;
  flightNumber: string;
  originIata: string;
  originCity: string;
  destinationIata: string;
  destinationCity: string;
  departureAt: string;
  arrivalAt: string;
  seatClass: 'ECONOMY' | 'BUSINESS';
  farePaidPence: number;
}

interface BookingHistoryEntry {
  id: string;
  reference: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalPricePence: number;
  createdAt: string;
  segments: FlightHistorySegment[];
}

const statusVariant: Record<BookingHistoryEntry['status'], 'default' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'danger',
};

function MikunAirWordmark() {
  return (
    <div className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 shadow-lg shadow-sky-500/30">
        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </span>
      <span className="text-white">
        Mikun<span className="text-sky-400">Air</span>
      </span>
    </div>
  );
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function durationLabel(departureAt: string, arrivalAt: string) {
  const mins = Math.round((new Date(arrivalAt).getTime() - new Date(departureAt).getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function isPast(iso: string) {
  return new Date(iso) < new Date();
}

function SegmentRow({ seg }: { seg: FlightHistorySegment }) {
  const past = isPast(seg.departureAt);
  return (
    <div className="flex items-center gap-4 py-3 border-t border-white/5 first:border-t-0">
      {/* Route */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="text-center shrink-0">
          <p className="text-white font-bold text-base leading-none">{seg.originIata}</p>
          <p className="text-white/40 text-xs mt-0.5">{seg.originCity}</p>
        </div>

        <div className="flex-1 flex flex-col items-center gap-0.5 px-2">
          <p className="text-white/30 text-xs">{durationLabel(seg.departureAt, seg.arrivalAt)}</p>
          <div className="w-full flex items-center gap-1">
            <div className="h-px flex-1 bg-white/20" />
            <svg className="h-3 w-3 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
            <div className="h-px flex-1 bg-white/20" />
          </div>
          <p className="text-white/30 text-xs">{seg.flightNumber}</p>
        </div>

        <div className="text-center shrink-0">
          <p className="text-white font-bold text-base leading-none">{seg.destinationIata}</p>
          <p className="text-white/40 text-xs mt-0.5">{seg.destinationCity}</p>
        </div>
      </div>

      {/* Times */}
      <div className="hidden sm:flex flex-col items-end shrink-0 text-right">
        <p className="text-white/70 text-sm">{formatTime(seg.departureAt)} → {formatTime(seg.arrivalAt)}</p>
        <p className={`text-xs mt-0.5 ${past ? 'text-white/30' : 'text-sky-400'}`}>
          {formatDateShort(seg.departureAt)}
        </p>
      </div>

      {/* Class */}
      <div className="shrink-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          seg.seatClass === 'BUSINESS'
            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            : 'bg-white/10 text-white/50 border border-white/10'
        }`}>
          {seg.seatClass === 'BUSINESS' ? 'Business' : 'Economy'}
        </span>
      </div>
    </div>
  );
}

function BookingCard({ entry }: { entry: BookingHistoryEntry }) {
  const isUpcoming = entry.segments.some((s) => !isPast(s.departureAt));

  return (
    <article
      aria-label={`Booking ${entry.reference}`}
      className={`bg-white/5 backdrop-blur-sm border rounded-2xl overflow-hidden transition-colors ${
        isUpcoming ? 'border-sky-500/30' : 'border-white/10'
      }`}
    >
      {/* Card header */}
      <div className={`px-5 py-3 flex items-center justify-between gap-4 border-b border-white/5 ${
        isUpcoming ? 'bg-sky-500/10' : ''
      }`}>
        <div className="flex items-center gap-3">
          <p className="font-mono font-bold text-sky-400 tracking-wide">{entry.reference}</p>
          {isUpcoming && (
            <span className="text-xs font-medium text-sky-300 bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 rounded-full">
              Upcoming
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-white/40">{formatPrice(entry.totalPricePence)}</p>
          <Badge variant={statusVariant[entry.status]}>{entry.status}</Badge>
          <Link
            to={`/profile/bookings/${entry.reference}`}
            className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
          >
            Details
          </Link>
        </div>
      </div>

      {/* Segments */}
      <div className="px-5">
        {entry.segments.map((seg) => (
          <SegmentRow key={seg.flightId} seg={seg} />
        ))}
      </div>
    </article>
  );
}

export function FlightHistoryPage() {
  useWindowTitle('Flight History');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { data: history, isLoading, error, refetch } = useQuery<BookingHistoryEntry[]>({
    queryKey: ['flightHistory'],
    queryFn: async () => {
      const { data } = await axiosClient.get<BookingHistoryEntry[]>('/bookings/history');
      return data;
    },
  });

  const upcoming = history?.filter((e) => e.segments.some((s) => !isPast(s.departureAt))) ?? [];
  const past = history?.filter((e) => e.segments.every((s) => isPast(s.departureAt))) ?? [];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
    >
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-slate-900/60">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" aria-label="MikunAir home">
            <MikunAirWordmark />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              My profile
            </Link>
            <button
              type="button"
              onClick={() => { void logout().then(() => navigate('/auth/login')); }}
              className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">

          <div>
            <h1 className="text-2xl font-bold text-white">Flight history</h1>
            <p className="text-sm text-white/40 mt-1">All your flights in one place</p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <Spinner label="Loading flight history…" />
            </div>
          )}

          {error && (
            <Alert variant="error" onRetry={() => void refetch()}>
              Failed to load flight history.
            </Alert>
          )}

          {history && history.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-12 text-center">
              <p className="text-white/40 text-sm">No flights yet.</p>
              <Link
                to="/"
                className="inline-block mt-4 px-4 py-2 text-sm font-medium bg-white rounded-lg transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                style={{ color: '#0f172a' }}
              >
                Search flights
              </Link>
            </div>
          )}

          {upcoming.length > 0 && (
            <section aria-labelledby="upcoming-heading" className="flex flex-col gap-4">
              <h2
                id="upcoming-heading"
                className="text-xs font-semibold uppercase tracking-wider text-white/40"
              >
                Upcoming
              </h2>
              {upcoming.map((entry) => (
                <BookingCard key={entry.id} entry={entry} />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section aria-labelledby="past-heading" className="flex flex-col gap-4">
              <h2
                id="past-heading"
                className="text-xs font-semibold uppercase tracking-wider text-white/40"
              >
                Past flights
              </h2>
              {past.map((entry) => (
                <BookingCard key={entry.id} entry={entry} />
              ))}
            </section>
          )}
        </div>
      </main>

      <footer className="border-t border-white/5 py-6">
        <p className="text-center text-xs text-white/20">
          © 2026 MikunAir. Portfolio project by Festus-Olaleye Ayomikun.
        </p>
      </footer>
    </div>
  );
}
