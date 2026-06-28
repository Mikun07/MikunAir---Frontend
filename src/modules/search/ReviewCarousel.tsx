import { useState, useEffect, useCallback } from 'react';

interface Review {
  id: number;
  author: string;
  location: string;
  rating: number;
  text: string;
  route: string;
  initials: string;
  avatarColor: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    author: 'Sofia Lindqvist',
    location: 'Stockholm, Sweden',
    rating: 5,
    text: 'Booking was effortless. Found my Stockholm to London flight in seconds. The seat upgrade for Business was worth every penny. MikunAir has become my go-to for Scandinavian routes.',
    route: 'ARN → LHR',
    initials: 'SL',
    avatarColor: 'bg-violet-500',
  },
  {
    id: 2,
    author: 'Erik Haugen',
    location: 'Oslo, Norway',
    rating: 5,
    text: 'Incredibly smooth experience from search to boarding pass. I love that I can differentiate adult and child passengers. Travelling with my kids has never been this stress-free.',
    route: 'OSL → CPH',
    initials: 'EH',
    avatarColor: 'bg-sky-500',
  },
  {
    id: 3,
    author: 'Amara Osei',
    location: 'London, UK',
    rating: 5,
    text: 'The round-trip booking flow is seamless. Both outbound and return flights were confirmed on one screen. Prices are transparent with no hidden fees on checkout.',
    route: 'LHR → ARN',
    initials: 'AO',
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 4,
    author: 'Marta Kowalski',
    location: 'Warsaw, Poland',
    rating: 4,
    text: 'Found a great deal using the NORDIC15 promo code. The airport search autocomplete is a brilliant touch. I just typed "Warsaw" and it found WAW immediately.',
    route: 'WAW → OSL',
    initials: 'MK',
    avatarColor: 'bg-rose-500',
  },
  {
    id: 5,
    author: 'James Thornton',
    location: 'Dublin, Ireland',
    rating: 5,
    text: 'Clean, fast, and no faff. The site loads instantly, the form is intuitive, and my booking confirmation arrived in under a minute. Exactly what travel booking should be.',
    route: 'DUB → CDG',
    initials: 'JT',
    avatarColor: 'bg-amber-500',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-amber-400' : 'text-white/20'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % REVIEWS.length);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + REVIEWS.length) % REVIEWS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next, isPaused]);

  const review = REVIEWS[activeIndex]!;

  return (
    <section
      aria-label="Customer reviews"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
          What our passengers say
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="relative bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8"
      >
        {/* Quote mark */}
        <svg
          className="absolute top-6 right-6 h-10 w-10 text-white/5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>

        <div className="flex flex-col gap-4">
          <StarRating rating={review.rating} />
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            {review.text}
          </p>
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full ${review.avatarColor} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                aria-hidden="true"
              >
                {review.initials}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-semibold text-sm">{review.author}</span>
                <span className="text-white/50 text-xs">{review.location}</span>
              </div>
            </div>
            <span className="text-sky-400 text-xs font-mono font-semibold bg-white/5 px-3 py-1 rounded-full">
              {review.route}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to review ${i + 1}`}
              aria-current={i === activeIndex ? 'true' : undefined}
              className={`
                h-1.5 rounded-full transition-all
                ${i === activeIndex ? 'w-6 bg-sky-400' : 'w-1.5 bg-white/20 hover:bg-white/40'}
              `}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous review"
            className="
              h-8 w-8 rounded-full border border-white/20 flex items-center justify-center
              text-white/60 hover:text-white hover:border-white/40
              transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
            "
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next review"
            className="
              h-8 w-8 rounded-full border border-white/20 flex items-center justify-center
              text-white/60 hover:text-white hover:border-white/40
              transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
            "
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
