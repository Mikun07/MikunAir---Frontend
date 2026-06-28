import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import type { FlightOption, ConnectingFlightOption, FlightSearchParams } from '@shared/hooks';
import { useFlightSearch } from '@shared/hooks';
import { useAuth } from '@modules/auth/AuthContext';
import { Alert, Spinner, Pagination } from '@shared/ui';
import { usePagination } from '@shared/hooks';
import { FlightResultsList } from './FlightResultsList';
import { ConnectingFlightCard } from './ConnectingFlightCard';
import type { SearchFormValues } from './SearchForm';
import { SearchForm } from './SearchForm';

const CONNECTING_PAGE_SIZE = 5;

interface ConnectingListProps {
  title: string;
  options: ConnectingFlightOption[];
  isLoading: boolean;
  selectedKey: string | null;
  onSelect: (option: ConnectingFlightOption) => void;
}

function ConnectingFlightResultsList({ title, options, isLoading, selectedKey, onSelect }: Readonly<ConnectingListProps>) {
  const headingId = `${title.toLowerCase().replace(/\s+/g, '-')}-heading`;
  const { currentPage, totalPages, pageItems, goToPage } = usePagination(options, CONNECTING_PAGE_SIZE);
  const key = (o: ConnectingFlightOption) => `${o.leg1.id}-${o.leg2.id}`;

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

      {!isLoading && options.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-10 text-center">
          <p className="text-white/40 text-sm">No connecting flights found for this route and date.</p>
        </div>
      )}

      {!isLoading && options.length > 0 && (
        <>
          <p className="sr-only" aria-live="polite">
            {options.length} connecting {options.length === 1 ? 'option' : 'options'} found
          </p>
          <ul className="flex flex-col gap-3">
            {pageItems.map((option) => (
              <li key={key(option)}>
                <ConnectingFlightCard
                  option={option}
                  selected={key(option) === selectedKey}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
            </div>
          )}
        </>
      )}
    </section>
  );
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

function paramsFromSearch(sp: URLSearchParams): FlightSearchParams | null {
  const origin = sp.get('origin');
  const destination = sp.get('destination');
  const departureDate = sp.get('departureDate');
  if (!origin || !destination || !departureDate) return null;

  const adults = Number(sp.get('adults') ?? '1');
  const children = Number(sp.get('children') ?? '0');
  const totalPassengers = Math.max(1, adults + children);

  return {
    origin,
    destination,
    departureDate,
    passengers: totalPassengers,
    returnDate: sp.get('returnDate') ?? undefined,
    seatClass: (sp.get('seatClass') as 'ECONOMY' | 'BUSINESS' | null) ?? 'ECONOMY',
  };
}

export function SearchResultsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = paramsFromSearch(searchParams);

  const { data, isLoading, error, refetch } = useFlightSearch(queryParams);

  const [selectedOutbound, setSelectedOutbound] = useState<FlightOption | null>(null);
  const [selectedInbound, setSelectedInbound] = useState<FlightOption | null>(null);
  const [selectedConnectingOutbound, setSelectedConnectingOutbound] = useState<ConnectingFlightOption | null>(null);
  const [selectedConnectingInbound, setSelectedConnectingInbound] = useState<ConnectingFlightOption | null>(null);

  const isReturnTrip = Boolean(searchParams.get('returnDate'));

  function handleSearch(values: SearchFormValues) {
    const params: Record<string, string> = {
      origin: values.origin,
      destination: values.destination,
      departureDate: values.departureDate,
      adults: String(values.adults),
      children: String(values.children),
      seatClass: values.seatClass,
      tripType: values.tripType,
    };
    if (values.returnDate) params.returnDate = values.returnDate;
    setSearchParams(params);
    setSelectedOutbound(null);
    setSelectedInbound(null);
    setSelectedConnectingOutbound(null);
    setSelectedConnectingInbound(null);
  }

  function handleContinue() {
    const adults = searchParams.get('adults') ?? '1';
    const children = searchParams.get('children') ?? '0';
    const seatClass = searchParams.get('seatClass') ?? 'ECONOMY';
    const passengers = String(Math.max(1, Number(adults) + Number(children)));

    const outbound = selectedOutbound ?? selectedConnectingOutbound?.leg1 ?? null;
    if (!outbound) return;

    const params = new URLSearchParams({ outboundFlightId: outbound.id, passengers, seatClass });

    if (selectedConnectingOutbound) {
      params.set('outboundLeg2FlightId', selectedConnectingOutbound.leg2.id);
    }
    if (selectedInbound) {
      params.set('inboundFlightId', selectedInbound.id);
    }
    if (selectedConnectingInbound) {
      params.set('inboundFlightId', selectedConnectingInbound.leg1.id);
      params.set('inboundLeg2FlightId', selectedConnectingInbound.leg2.id);
    }

    navigate(`/booking?${params.toString()}`);
  }

  const hasOutbound = selectedOutbound !== null || selectedConnectingOutbound !== null;
  const hasInbound = selectedInbound !== null || selectedConnectingInbound !== null;
  const canContinue = hasOutbound && (!isReturnTrip || hasInbound);

  const initialValues: Partial<SearchFormValues> = {
    origin: searchParams.get('origin') ?? '',
    destination: searchParams.get('destination') ?? '',
    departureDate: searchParams.get('departureDate') ?? '',
    returnDate: searchParams.get('returnDate') ?? '',
    adults: Number(searchParams.get('adults') ?? '1'),
    children: Number(searchParams.get('children') ?? '0'),
    seatClass: (searchParams.get('seatClass') as 'ECONOMY' | 'BUSINESS') ?? 'ECONOMY',
    tripType: (searchParams.get('tripType') as 'one-way' | 'round-trip') ?? 'one-way',
  };

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
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  My bookings
                </Link>
                <button
                  type="button"
                  onClick={() => { void logout().then(() => navigate('/auth/login')); }}
                  className="px-4 py-1.5 text-sm font-medium text-slate-900 bg-white hover:bg-white/90 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-1.5 text-sm font-medium text-slate-900 bg-white hover:bg-white/90 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Search form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/40">
            <SearchForm onSearch={handleSearch} initialValues={initialValues} />
          </div>

          {error && (
            <Alert variant="error" title="Search failed" onRetry={() => void refetch()}>
              Unable to load flights. Please try again.
            </Alert>
          )}

          {!error && (
            <div className="flex flex-col gap-6">
              <FlightResultsList
                title="Outbound flights"
                flights={data?.outbound ?? []}
                isLoading={isLoading}
                selectedId={selectedOutbound?.id ?? null}
                onSelect={(f) => { setSelectedOutbound(f); setSelectedConnectingOutbound(null); }}
              />

              <ConnectingFlightResultsList
                title="Outbound connecting flights"
                options={data?.connectingOutbound ?? []}
                isLoading={isLoading}
                selectedKey={selectedConnectingOutbound ? `${selectedConnectingOutbound.leg1.id}-${selectedConnectingOutbound.leg2.id}` : null}
                onSelect={(o) => { setSelectedConnectingOutbound(o); setSelectedOutbound(null); }}
              />

              {isReturnTrip && (
                <>
                  <FlightResultsList
                    title="Return flights"
                    flights={data?.inbound ?? []}
                    isLoading={isLoading}
                    selectedId={selectedInbound?.id ?? null}
                    onSelect={(f) => { setSelectedInbound(f); setSelectedConnectingInbound(null); }}
                  />

                  <ConnectingFlightResultsList
                    title="Return connecting flights"
                    options={data?.connectingInbound ?? []}
                    isLoading={isLoading}
                    selectedKey={selectedConnectingInbound ? `${selectedConnectingInbound.leg1.id}-${selectedConnectingInbound.leg2.id}` : null}
                    onSelect={(o) => { setSelectedConnectingInbound(o); setSelectedInbound(null); }}
                  />
                </>
              )}
            </div>
          )}

          {canContinue && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleContinue}
                className="px-8 py-3 rounded-2xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-colors shadow-lg shadow-sky-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                Continue to booking
              </button>
            </div>
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
