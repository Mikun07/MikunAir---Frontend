import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@shared/api';
import { Alert, Badge, Breadcrumbs, Button, Card, Modal, Spinner } from '@shared/ui';
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

export function BookingDetailPage() {
  const { ref } = useParams<{ ref: string }>();
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
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Profile', href: '/profile' },
              { label: 'Booking details' },
            ]}
          />
          <h1 id="booking-detail-heading" className="text-2xl font-bold text-gray-900 mt-2">
            Booking details
          </h1>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
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
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Reference</p>
                  <p className="font-mono text-2xl font-bold text-blue-700">{booking.reference}</p>
                </div>
                <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-gray-500">Total price</dt>
                <dd className="font-semibold text-gray-900">{formatPrice(booking.totalPricePence)}</dd>
                <dt className="text-gray-500">Booked on</dt>
                <dd className="text-gray-700">
                  {new Date(booking.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </dl>
            </Card>

            <section aria-labelledby="passengers-heading">
              <h2 id="passengers-heading" className="text-lg font-semibold text-gray-800 mb-3">
                Passengers
              </h2>
              <ul className="flex flex-col gap-2" role="list">
                {booking.passengers.map((p, i) => (
                  <li key={i}>
                    <Card padding="sm">
                      <p className="font-medium text-gray-900">{p.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {p.documentType} · {p.documentNumber}
                      </p>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>

            {booking.status === 'CONFIRMED' && (
              <Button variant="danger" onClick={() => setCancelOpen(true)}>
                Cancel booking
              </Button>
            )}
          </>
        )}
      </div>

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
    </main>
  );
}
