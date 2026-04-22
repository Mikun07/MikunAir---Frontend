import { Link, useLocation, useParams } from 'react-router-dom';
import { Card } from '@shared/ui';
import { formatPrice } from '@shared/utils';

interface LocationState {
  reference?: string;
  totalPricePence?: number;
}

export function ConfirmationPage() {
  const { ref } = useParams<{ ref: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const reference = state.reference ?? ref ?? '—';
  const totalPricePence = state.totalPricePence;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div
          className="mx-auto mb-6 w-16 h-16 flex items-center justify-center rounded-full bg-green-100"
          aria-hidden="true"
        >
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your booking reference is:
        </p>

        <Card className="mb-6">
          <p
            data-testid="booking-reference"
            className="text-3xl font-mono font-bold text-blue-700 tracking-widest"
          >
            {reference}
          </p>
          {totalPricePence !== undefined && (
            <p className="mt-2 text-sm text-gray-500">
              Total paid: <strong>{formatPrice(totalPricePence)}</strong>
            </p>
          )}
        </Card>

        <p className="text-sm text-gray-500 mb-6">
          A confirmation email has been sent to you.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/profile/bookings/${reference}`}
            className="inline-flex items-center justify-center font-medium rounded px-4 py-2 text-base border border-blue-700 text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
          >
            View booking
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center font-medium rounded px-4 py-2 text-base bg-blue-700 text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
          >
            Search another flight
          </Link>
        </div>
      </div>
    </main>
  );
}
