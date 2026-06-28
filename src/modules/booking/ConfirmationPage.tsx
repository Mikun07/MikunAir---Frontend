import { Link, useLocation, useParams } from 'react-router-dom';
import { formatPrice } from '@shared/utils';

interface LocationState {
  reference?: string;
  totalPricePence?: number;
}

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

export function ConfirmationPage() {
  const { ref } = useParams<{ ref: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const reference = state.reference ?? ref ?? '—';
  const totalPricePence = state.totalPricePence;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
    >
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-slate-900/60">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link to="/" aria-label="MikunAir home">
            <MikunAirWordmark />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md flex flex-col items-center gap-8">

          {/* Success icon */}
          <div
            className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30"
            aria-hidden="true"
          >
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Booking confirmed!</h1>
            <p className="text-white/50 mt-1 text-sm">Your booking reference is</p>
          </div>

          {/* Reference card */}
          <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl shadow-black/40">
            <p
              data-testid="booking-reference"
              className="text-3xl font-mono font-bold text-sky-400 tracking-widest"
            >
              {reference}
            </p>
            {totalPricePence !== undefined && (
              <p className="mt-3 text-sm text-white/40">
                Total paid:{' '}
                <strong className="text-white">{formatPrice(totalPricePence)}</strong>
              </p>
            )}
          </div>

          <p className="text-sm text-white/30 text-center">
            A confirmation email has been sent to you.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              to={`/profile/bookings/${reference}`}
              className="flex-1 flex items-center justify-center px-5 py-2.5 rounded-2xl text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              View booking
            </Link>
            <Link
              to="/"
              className="flex-1 flex items-center justify-center px-5 py-2.5 rounded-2xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-colors shadow-lg shadow-sky-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Search another flight
            </Link>
          </div>
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
