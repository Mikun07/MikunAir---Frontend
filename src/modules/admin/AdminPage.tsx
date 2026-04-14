import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@shared/api';
import { Alert, Badge, Button, Modal, Spinner, Input } from '@shared/ui';
import { formatPrice } from '@shared/utils';

interface Flight {
  id: string;
  flightNumber: string;
  originIataCode: string;
  destinationIataCode: string;
  departureAt: string;
  arrivalAt: string;
  economySeatsAvailable: number;
  economyFarePence: number;
  active: boolean;
}

interface CreateFlightDTO {
  flightNumber: string;
  originIataCode: string;
  destinationIataCode: string;
  departureAt: string;
  arrivalAt: string;
  economySeatsAvailable: number;
  economyFarePence: number;
}

function emptyForm(): CreateFlightDTO {
  return {
    flightNumber: '',
    originIataCode: '',
    destinationIataCode: '',
    departureAt: '',
    arrivalAt: '',
    economySeatsAvailable: 150,
    economyFarePence: 10000,
  };
}

export function AdminPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateFlightDTO>(emptyForm());
  const [createError, setCreateError] = useState('');

  const { data: flights, isLoading, error } = useQuery<Flight[]>({
    queryKey: ['admin-flights'],
    queryFn: async () => {
      const { data } = await axiosClient.get<Flight[]>('/admin/flights');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (dto: CreateFlightDTO) => axiosClient.post('/admin/flights', dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-flights'] });
      setCreateOpen(false);
      setForm(emptyForm());
      setCreateError('');
    },
    onError: () => setCreateError('Failed to create flight. Check the details and try again.'),
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => axiosClient.delete(`/admin/flights/${id}`),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['admin-flights'] }),
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Flight management</h1>
          <Button onClick={() => setCreateOpen(true)}>Add flight</Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner label="Loading flights…" />
          </div>
        )}

        {error && (
          <Alert variant="error" onRetry={() => void queryClient.invalidateQueries({ queryKey: ['admin-flights'] })}>
            Failed to load flights.
          </Alert>
        )}

        {flights && flights.length === 0 && (
          <p className="text-gray-500">No flights in the system yet.</p>
        )}

        {flights && flights.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" aria-label="Flight schedule">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-4 font-medium">Flight</th>
                  <th className="py-2 pr-4 font-medium">Route</th>
                  <th className="py-2 pr-4 font-medium">Departure</th>
                  <th className="py-2 pr-4 font-medium">Fare</th>
                  <th className="py-2 pr-4 font-medium">Seats</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((f) => (
                  <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-mono font-semibold">{f.flightNumber}</td>
                    <td className="py-2 pr-4">
                      {f.originIataCode} → {f.destinationIataCode}
                    </td>
                    <td className="py-2 pr-4">
                      {new Date(f.departureAt).toLocaleString('en-GB', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-2 pr-4">{formatPrice(f.economyFarePence)}</td>
                    <td className="py-2 pr-4">{f.economySeatsAvailable}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={f.active ? 'success' : 'danger'}>
                        {f.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-2">
                      {f.active && (
                        <Button
                          variant="danger"
                          size="sm"
                          loading={deactivateMutation.isPending}
                          onClick={() => deactivateMutation.mutate(f.id)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateError('');
          setForm(emptyForm());
        }}
        title="Add flight"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="flex flex-col gap-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Flight number"
              value={form.flightNumber}
              onChange={(e) => setForm({ ...form, flightNumber: e.target.value })}
              required
            />
            <Input
              label="Economy fare (pence)"
              type="number"
              value={form.economyFarePence}
              onChange={(e) => setForm({ ...form, economyFarePence: Number(e.target.value) })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Origin IATA"
              value={form.originIataCode}
              onChange={(e) => setForm({ ...form, originIataCode: e.target.value.toUpperCase() })}
              maxLength={3}
              required
            />
            <Input
              label="Destination IATA"
              value={form.destinationIataCode}
              onChange={(e) =>
                setForm({ ...form, destinationIataCode: e.target.value.toUpperCase() })
              }
              maxLength={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Departure"
              type="datetime-local"
              value={form.departureAt}
              onChange={(e) => setForm({ ...form, departureAt: e.target.value })}
              required
            />
            <Input
              label="Arrival"
              type="datetime-local"
              value={form.arrivalAt}
              onChange={(e) => setForm({ ...form, arrivalAt: e.target.value })}
              required
            />
          </div>
          <Input
            label="Economy seats"
            type="number"
            value={form.economySeatsAvailable}
            onChange={(e) => setForm({ ...form, economySeatsAvailable: Number(e.target.value) })}
            required
          />

          {createError && (
            <Alert variant="error">{createError}</Alert>
          )}

          <div className="flex gap-3 justify-end mt-2">
            <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Add flight
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
