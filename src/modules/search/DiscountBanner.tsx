interface Deal {
  code: string;
  description: string;
  discount: string;
  expiry: string;
}

const DEALS: Deal[] = [
  { code: 'NORDIC15', description: 'Scandinavia routes', discount: '15% off', expiry: 'Ends 31 Jul' },
  { code: 'SUMMER25', description: 'All summer flights', discount: '25% off', expiry: 'Ends 15 Aug' },
  { code: 'BIZMILE', description: 'Business class upgrade', discount: '£50 off', expiry: 'Limited seats' },
  { code: 'EARLYBIRD', description: 'Book 60 days ahead', discount: '20% off', expiry: 'Ongoing' },
];

export function DiscountBanner() {
  return (
    <section aria-label="Current deals and discount codes" className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 bg-promo/10 text-promo-dark px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Hot deals
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DEALS.map((deal) => (
          <div
            key={deal.code}
            className="
              group relative flex flex-col gap-1 bg-white/5 border border-white/10
              hover:bg-white/10 hover:border-promo/30
              rounded-2xl px-4 py-3 transition-colors cursor-default
            "
          >
            <span className="text-promo font-bold text-lg leading-none">{deal.discount}</span>
            <span className="text-white/90 text-xs font-medium leading-tight">{deal.description}</span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <code className="bg-white/10 text-promo text-xs font-mono px-2 py-0.5 rounded">
                {deal.code}
              </code>
              <span className="text-white/40 text-xs">{deal.expiry}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
