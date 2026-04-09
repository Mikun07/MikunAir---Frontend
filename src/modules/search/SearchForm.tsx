import { FormEvent, useState } from 'react';
import { z } from 'zod';
import { Button, Input, Alert } from '@shared/ui';

export interface SearchFormValues {
  origin: string;
  destination: string;
  departureDate: string;
  passengers: number;
  returnDate?: string;
  seatClass: 'ECONOMY' | 'BUSINESS';
}

interface SearchFormProps {
  onSearch: (values: SearchFormValues) => void;
  initialValues?: Partial<SearchFormValues>;
}

const today = () => new Date().toISOString().split('T')[0] ?? '';

const schema = z
  .object({
    origin: z.string().length(3, 'Enter a valid 3-letter IATA code').toUpperCase(),
    destination: z.string().length(3, 'Enter a valid 3-letter IATA code').toUpperCase(),
    departureDate: z.string().min(1, 'Select a departure date'),
    returnDate: z.string().optional(),
    passengers: z.coerce.number().int().min(1).max(9),
    seatClass: z.enum(['ECONOMY', 'BUSINESS']),
  })
  .refine((d) => d.origin !== d.destination, {
    message: 'Origin and destination must be different',
    path: ['destination'],
  })
  .refine((d) => d.departureDate >= today(), {
    message: 'Departure date must be in the future',
    path: ['departureDate'],
  })
  .refine((d) => !d.returnDate || d.returnDate > d.departureDate, {
    message: 'Return date must be after departure date',
    path: ['returnDate'],
  });

type FormErrors = Partial<Record<keyof SearchFormValues, string>>;

export function SearchForm({ onSearch, initialValues = {} }: SearchFormProps) {
  const [origin, setOrigin] = useState(initialValues.origin ?? '');
  const [destination, setDestination] = useState(initialValues.destination ?? '');
  const [departureDate, setDepartureDate] = useState(initialValues.departureDate ?? '');
  const [returnDate, setReturnDate] = useState(initialValues.returnDate ?? '');
  const [passengers, setPassengers] = useState(initialValues.passengers ?? 1);
  const [seatClass, setSeatClass] = useState<'ECONOMY' | 'BUSINESS'>(
    initialValues.seatClass ?? 'ECONOMY',
  );
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = schema.safeParse({
      origin,
      destination,
      departureDate,
      returnDate: returnDate || undefined,
      passengers,
      seatClass,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        origin: fieldErrors.origin?.[0],
        destination: fieldErrors.destination?.[0],
        departureDate: fieldErrors.departureDate?.[0],
        returnDate: fieldErrors.returnDate?.[0],
        passengers: fieldErrors.passengers?.[0],
      });
      return;
    }
    setErrors({});
    onSearch(result.data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Flight search"
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="From (IATA)"
          value={origin}
          onChange={(e) => setOrigin(e.target.value.toUpperCase())}
          error={errors.origin}
          placeholder="e.g. LHR"
          maxLength={3}
          required
        />
        <Input
          label="To (IATA)"
          value={destination}
          onChange={(e) => setDestination(e.target.value.toUpperCase())}
          error={errors.destination}
          placeholder="e.g. ARN"
          maxLength={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Departure date"
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          error={errors.departureDate}
          min={today()}
          required
        />
        <Input
          label="Return date (optional)"
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          error={errors.returnDate}
          min={departureDate || today()}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="passengers" className="text-sm font-medium text-gray-700">
            Passengers
          </label>
          <select
            id="passengers"
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'passenger' : 'passengers'}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-1">Seat class</legend>
            <div className="flex gap-4">
              {(['ECONOMY', 'BUSINESS'] as const).map((cls) => (
                <label key={cls} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="seatClass"
                    value={cls}
                    checked={seatClass === cls}
                    onChange={() => setSeatClass(cls)}
                  />
                  {cls.charAt(0) + cls.slice(1).toLowerCase()}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {Object.values(errors).some(Boolean) && (
        <Alert variant="error" title="Please fix the following errors">
          {Object.values(errors).filter(Boolean).join('. ')}
        </Alert>
      )}

      <Button type="submit" size="lg">
        Search flights
      </Button>
    </form>
  );
}
