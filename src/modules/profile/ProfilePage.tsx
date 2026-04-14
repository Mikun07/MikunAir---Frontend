import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@shared/api';
import { useAuth } from '@modules/auth/AuthContext';
import { Spinner, Alert, Button, Badge, Card, Modal } from '@shared/ui';
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

export function ProfilePage() {
  const { user, logout } = useAuth();
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
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My profile</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <Button variant="ghost" onClick={() => void logout()}>
            Sign out
          </Button>
        </div>

        <section aria-labelledby="bookings-heading">
          <h2 id="bookings-heading" className="text-lg font-semibold text-gray-800 mb-3">
            My bookings
          </h2>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner label="Loading bookings…" />
            </div>
          )}

          {error && (
            <Alert variant="error" onRetry={() => void queryClient.invalidateQueries({ queryKey: ['bookings'] })}>
              Failed to load bookings.
            </Alert>
          )}

          {bookings && bookings.length === 0 && (
            <p className="text-gray-500">No bookings yet.</p>
          )}

          {bookings && bookings.length > 0 && (
            <ul className="flex flex-col gap-3" role="list">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Card padding="sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono font-semibold text-blue-700">{b.reference}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(b.createdAt).toLocaleDateString('en-GB')} ·{' '}
                          {formatPrice(b.totalPricePence)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
                        <Link
                          to={`/profile/bookings/${b.reference}`}
                          className="text-sm text-blue-700 underline hover:no-underline"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="gdpr-heading">
          <h2 id="gdpr-heading" className="text-lg font-semibold text-gray-800 mb-2">
            Data & privacy
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Under GDPR you have the right to request erasure of your personal data.
          </p>
          <Button variant="danger" onClick={() => setErasureOpen(true)}>
            Request data erasure
          </Button>
        </section>
      </div>

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
    </main>
  );
}
