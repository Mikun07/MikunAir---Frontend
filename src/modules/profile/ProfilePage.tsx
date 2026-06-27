import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@shared/api';
import { useAuth } from '@modules/auth/AuthContext';
import { Spinner, Alert, Button, Badge, Modal } from '@shared/ui';
import { formatPrice } from '@shared/utils';

interface BookingSummary {
  id: string;
  reference: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalPricePence: number;
  createdAt: string;
}

const statusVariant: Record<BookingSummary['status'], 'default' | 'success' | 'warning' | 'danger'> = {
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

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [erasureOpen, setErasureOpen] = useState(false);
  const [erasureError, setErasureError] = useState('');

  const { data: bookings, isLoading, error } = useQuery<BookingSummary[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await axiosClient.get<BookingSummary[]>('/bookings');
      return data;
    },
  });

  const erasureMutation = useMutation({
    mutationFn: async () => axiosClient.post('/users/me/erasure'),
    onSuccess: async () => {
      await logout();
    },
    onError: () => {
      setErasureError('Erasure request failed. Please contact support.');
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
          <div className="flex items-center gap-1">
            <Link
              to="/profile/history"
              className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Flight history
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
        <div className="max-w-3xl mx-auto flex flex-col gap-8">

          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold text-white">My profile</h1>
            <p className="text-sm text-white/40 mt-1">{user?.email}</p>
          </div>

          {/* Bookings section */}
          <section aria-labelledby="bookings-heading">
            <h2 id="bookings-heading" className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              My bookings
            </h2>

            {isLoading && (
              <div className="flex justify-center py-10">
                <Spinner label="Loading bookings…" />
              </div>
            )}

            {error && (
              <Alert
                variant="error"
                onRetry={() => void queryClient.invalidateQueries({ queryKey: ['bookings'] })}
              >
                Failed to load bookings.
              </Alert>
            )}

            {bookings && bookings.length === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-10 text-center">
                <p className="text-white/40 text-sm">No bookings yet.</p>
                <Link
                  to="/"
                  className="inline-block mt-4 px-4 py-2 text-sm font-medium text-midnight bg-white hover:bg-white/90 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  style={{ color: '#0f172a' }}
                >
                  Search flights
                </Link>
              </div>
            )}

            {bookings && bookings.length > 0 && (
              <ul className="flex flex-col gap-3" role="list">
                {bookings.map((b) => (
                  <li key={b.id}>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-2xl px-5 py-4 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="font-mono font-bold text-sky-400 text-base tracking-wide">
                            {b.reference}
                          </p>
                          <p className="text-sm text-white/40">
                            {new Date(b.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            · {formatPrice(b.totalPricePence)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
                          <Link
                            to={`/profile/bookings/${b.reference}`}
                            className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* GDPR section */}
          <section
            aria-labelledby="gdpr-heading"
            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5"
          >
            <h2 id="gdpr-heading" className="text-sm font-semibold text-white/80 mb-1">
              Data &amp; privacy
            </h2>
            <p className="text-sm text-white/40 mb-4">
              Under GDPR you have the right to request erasure of your personal data.
            </p>
            <Button variant="danger" onClick={() => setErasureOpen(true)}>
              Request data erasure
            </Button>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <p className="text-center text-xs text-white/20">
          © 2026 MikunAir. Portfolio project by Festus-Olaleye Ayomikun.
        </p>
      </footer>

      <Modal
        open={erasureOpen}
        onClose={() => {
          setErasureOpen(false);
          setErasureError('');
        }}
        title="Confirm data erasure"
      >
        <p className="text-sm text-gray-600 mb-4">
          This will permanently anonymise all your personal data. Your booking records are retained
          for 7 years as required by law. This action cannot be undone.
        </p>
        {erasureError && (
          <div className="mb-4">
            <Alert variant="error">{erasureError}</Alert>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setErasureOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={erasureMutation.isPending}
            onClick={() => erasureMutation.mutate()}
          >
            Erase my data
          </Button>
        </div>
      </Modal>
    </div>
  );
}
