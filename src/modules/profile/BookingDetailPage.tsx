import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@shared/api';
import { useAuth } from '@modules/auth/AuthContext';
import { Alert, Badge, Button, Modal, Spinner } from '@shared/ui';
import { formatPrice } from '@shared/utils';

interface Passenger {
  fullName: string;
  dateOfBirth: string;
  documentType: string;
  documentNumber: string;
}

interface BookingDetail {
  id: string;
  reference: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalPricePence: number;
  createdAt: string;
  passengers: Passenger[];
}

const statusVariant: Record<BookingDetail['status'], 'default' | 'success' | 'warning' | 'danger'> = {
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

export function BookingDetailPage() {
  const { ref } = useParams<{ ref: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const { data: booking, isLoading, error } = useQuery<BookingDetail>({
    queryKey: ['booking', ref],
    queryFn: async () => {
      const { data } = await axiosClient.get<BookingDetail>(`/bookings/${ref ?? ''}`);
      return data;
    },
    enabled: Boolean(ref),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => axiosClient.post(`/bookings/${ref ?? ''}/cancel`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['booking', ref] });
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setCancelOpen(false);
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setCancelError(
        status === 409
          ? 'This booking has already been cancelled.'
          : 'Cancellation failed. Please try again.',
      );
    },
  });

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
          <button
            type="button"
            onClick={() => { void logout().then(() => navigate('/auth/login')); }}
            className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-white/40">
              <li>
                <Link to="/" className="hover:text-white/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/profile" className="hover:text-white/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded">
                  Profile
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white/70 font-medium">Booking details</li>
            </ol>
          </nav>

          <h1 className="text-2xl font-bold text-white -mt-4">Booking details</h1>

          {isLoading && (
            <div className="flex justify-center py-10">
              <Spinner label="Loading booking…" />
            </div>
          )}

          {error && (
            <Alert
              variant="error"
              onRetry={() => void queryClient.invalidateQueries({ queryKey: ['booking', ref] })}
            >
              Failed to load booking.
            </Alert>
          )}

          {booking && (
            <>
              {/* Reference card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Reference</p>
                    <p className="font-mono text-2xl font-bold text-sky-400 tracking-wide">
                      {booking.reference}
                    </p>
                  </div>
                  <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-white/10 pt-4">
                  <dt className="text-white/40">Total price</dt>
                  <dd className="font-semibold text-white">{formatPrice(booking.totalPricePence)}</dd>
                  <dt className="text-white/40">Booked on</dt>
                  <dd className="text-white/70">
                    {new Date(booking.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </dl>
              </div>

              {/* Passengers */}
              <section aria-labelledby="passengers-heading">
                <h2
                  id="passengers-heading"
                  className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4"
                >
                  Passengers
                </h2>
                <ul className="flex flex-col gap-3">
                  {booking.passengers.map((p) => (
                    <li
                      key={p.documentNumber}
                      className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4"
                    >
                      <p className="font-medium text-white">{p.fullName}</p>
                      <p className="text-sm text-white/40 mt-0.5">
                        {p.documentType} · {p.documentNumber}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              {booking.status === 'CONFIRMED' && (
                <div>
                  <Button variant="danger" onClick={() => setCancelOpen(true)}>
                    Cancel booking
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <p className="text-center text-xs text-white/20">
          © 2026 MikunAir. Portfolio project by Festus-Olaleye Ayomikun.
        </p>
      </footer>

      <Modal
        open={cancelOpen}
        onClose={() => {
          setCancelOpen(false);
          setCancelError('');
        }}
        title="Cancel booking"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to cancel booking <strong>{ref}</strong>? This cannot be undone.
        </p>
        {cancelError && (
          <div className="mb-4">
            <Alert variant="error">{cancelError}</Alert>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setCancelOpen(false)}>
            Keep booking
          </Button>
          <Button
            variant="danger"
            loading={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            Confirm cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
