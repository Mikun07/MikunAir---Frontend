import { useNavigate, Link } from 'react-router-dom';
import { useWindowTitle } from '@shared/hooks';
import type { SearchFormValues } from './SearchForm';
import { SearchForm } from './SearchForm';
import { DiscountBanner } from './DiscountBanner';
import { ReviewCarousel } from './ReviewCarousel';

function MikunAirLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl';
  return (
    <div className={`inline-flex items-center gap-2 ${textSize} font-extrabold tracking-tight`}>
      {/* Plane icon */}
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-sky shadow-lg shadow-sky/30">
        <svg
          className="h-5 w-5 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </span>
      <span className="text-white">
        Mikun<span className="text-sky">Air</span>
      </span>
    </div>
  );
}

const STATS = [
  { value: '120+', label: 'Destinations' },
  { value: '2M+', label: 'Happy passengers' },
  { value: '4.9', label: 'App rating' },
  { value: '24/7', label: 'Support' },
];

function StatBar() {
  return (
    <div className="grid grid-cols-4 gap-4 py-4 border-t border-white/10">
      {STATS.map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center text-center">
          <span className="text-white font-bold text-xl sm:text-2xl leading-none">{value}</span>
          <span className="text-white/50 text-xs mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}

const POPULAR_ROUTES = [
  { from: 'ARN', to: 'LHR', label: 'Stockholm → London', price: 'from £89' },
  { from: 'OSL', to: 'CPH', label: 'Oslo → Copenhagen', price: 'from £49' },
  { from: 'HEL', to: 'AMS', label: 'Helsinki → Amsterdam', price: 'from £109' },
  { from: 'GOT', to: 'BCN', label: 'Gothenburg → Barcelona', price: 'from £119' },
];

function PopularRoutes({ onRouteClick }: { onRouteClick: (from: string, to: string) => void }) {
  return (
    <section aria-label="Popular routes" className="w-full">
      <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
        Popular routes
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {POPULAR_ROUTES.map((route) => (
          <button
            key={`${route.from}-${route.to}`}
            type="button"
            onClick={() => onRouteClick(route.from, route.to)}
            className="
              group flex flex-col gap-0.5 bg-white/5 hover:bg-white/10
              border border-white/10 hover:border-sky/40
              rounded-2xl px-4 py-3 text-left transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-sky
            "
          >
            <span className="text-white text-sm font-medium leading-tight group-hover:text-sky transition-colors">
              {route.label}
            </span>
            <span className="text-promo text-xs font-semibold">{route.price}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  useWindowTitle('Search Flights');
  const navigate = useNavigate();

  function handleSearch(values: SearchFormValues) {
    const params = new URLSearchParams({
      origin: values.origin,
      destination: values.destination,
      departureDate: values.departureDate,
      adults: String(values.adults),
      children: String(values.children),
      seatClass: values.seatClass,
      tripType: values.tripType,
    });
    if (values.returnDate) params.set('returnDate', values.returnDate);
    navigate(`/search?${params.toString()}`);
  }

  function handleRouteClick(from: string, to: string) {
    navigate(`/search?origin=${from}&destination=${to}&departureDate=&adults=1&children=0&seatClass=ECONOMY&tripType=one-way`);
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>
      {/* Navigation bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-midnight/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <MikunAirLogo size="sm" />
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            <Link
              to="/auth/login"
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
            >
              Sign in
            </Link>
            <Link
              to="/auth/register"
              className="px-4 py-2 text-sm font-medium text-midnight bg-white hover:bg-white/90 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {/* Hero section */}
        <section
          aria-label="Flight search"
          className="max-w-7xl mx-auto px-4 pt-16 pb-12 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start"
        >
          {/* Left column — brand + stats + deals */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <MikunAirLogo size="lg" />
              <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-md">
                Fly smarter across Scandinavia and beyond. Transparent prices, instant booking, no hidden fees.
              </p>
            </div>

            <StatBar />

            {/* Decorative destination imagery placeholder with floating badges */}
            <div
              className="relative h-48 sm:h-56 rounded-3xl overflow-hidden"
              aria-hidden="true"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #1e3a5f 40%, #0f172a 100%)',
              }}
            >
              {/* Stylised globe / route lines */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20"
                viewBox="0 0 400 200"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              >
                <ellipse cx="200" cy="100" rx="150" ry="90" />
                <ellipse cx="200" cy="100" rx="100" ry="90" />
                <ellipse cx="200" cy="100" rx="50" ry="90" />
                <line x1="50" y1="100" x2="350" y2="100" />
                <line x1="200" y1="10" x2="200" y2="190" />
              </svg>
              {/* Flight path arc */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" fill="none" aria-hidden="true">
                <path
                  d="M 60 140 Q 200 20 340 140"
                  stroke="#0ea5e9"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                  opacity="0.7"
                />
                <circle cx="60" cy="140" r="4" fill="#0ea5e9" opacity="0.9" />
                <circle cx="340" cy="140" r="4" fill="#0ea5e9" opacity="0.9" />
                {/* Plane on path */}
                <text x="192" y="72" fontSize="18" textAnchor="middle" fill="white" opacity="0.9">✈</text>
              </svg>
              {/* Floating stat badges */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  ✈ 37 airlines
                </span>
                <span className="bg-sky/20 backdrop-blur-sm border border-sky/30 text-sky text-xs px-3 py-1.5 rounded-full font-medium">
                  🌍 120+ destinations
                </span>
              </div>
            </div>

            <PopularRoutes onRouteClick={handleRouteClick} />
          </div>

          {/* Right column — search form */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
              <h2 className="text-white font-bold text-xl mb-6">Search flights</h2>
              <SearchForm onSearch={handleSearch} />
            </div>
          </div>
        </section>

        {/* Discount banner + reviews */}
        <section className="max-w-7xl mx-auto px-4 pb-16 flex flex-col gap-12">
          <DiscountBanner />
          <ReviewCarousel />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-xs">
          <span>© 2026 MikunAir. Portfolio project by Festus-Olaleye Ayomikun.</span>
          <div className="flex gap-4">
            <Link to="/auth/login" className="hover:text-white/60 transition-colors">Sign in</Link>
            <Link to="/auth/register" className="hover:text-white/60 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
