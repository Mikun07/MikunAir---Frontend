import { FormEvent, useState } from 'react';
import { z } from 'zod';
import { Button, Alert } from '@shared/ui';
import { AirportCombobox } from './AirportCombobox';
import { PassengerPicker, PassengerCounts } from './PassengerPicker';

export interface SearchFormValues {
  origin: string;
  destination: string;
  tripType: 'one-way' | 'round-trip';
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  seatClass: 'ECONOMY' | 'BUSINESS';
}

interface SearchFormProps {
  onSearch: (values: SearchFormValues) => void;
  initialValues?: Partial<SearchFormValues>;
}

const today = () => new Date().toISOString().split('T')[0] ?? '';

const schema = z
  .object({
    origin: z
      .string()
      .length(3, 'Select a valid origin airport')
      .toUpperCase(),
    destination: z
      .string()
      .length(3, 'Select a valid destination airport')
      .toUpperCase(),
    tripType: z.enum(['one-way', 'round-trip']),
    departureDate: z.string().min(1, 'Select a departure date'),
    returnDate: z.string().optional(),
    adults: z.number().int().min(1, 'At least 1 adult required'),
    children: z.number().int().min(0),
    seatClass: z.enum(['ECONOMY', 'BUSINESS']),
  })
  .refine((d) => d.origin !== d.destination, {
    message: 'Origin and destination must be different',
    path: ['destination'],
  })
  .refine((d) => d.departureDate >= today(), {
    message: 'Departure date must be today or in the future',
    path: ['departureDate'],
  })
  .refine((d) => d.tripType === 'one-way' || (!!d.returnDate && d.returnDate > d.departureDate), {
    message: 'Return date must be after departure date',
    path: ['returnDate'],
  });

type FormErrors = Partial<Record<string, string>>;

const SEAT_CLASSES = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'BUSINESS', label: 'Business' },
] as const;

export function SearchForm({ onSearch, initialValues = {} }: SearchFormProps) {
  const [origin, setOrigin] = useState(initialValues.origin ?? '');
  const [destination, setDestination] = useState(initialValues.destination ?? '');
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>(
    initialValues.tripType ?? 'one-way',
  );
  const [departureDate, setDepartureDate] = useState(initialValues.departureDate ?? '');
  const [returnDate, setReturnDate] = useState(initialValues.returnDate ?? '');
  const [passengers, setPassengers] = useState<PassengerCounts>({
    adults: initialValues.adults ?? 1,
    children: initialValues.children ?? 0,
  });
  const [seatClass, setSeatClass] = useState<'ECONOMY' | 'BUSINESS'>(
    initialValues.seatClass ?? 'ECONOMY',
  );
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = schema.safeParse({
      origin,
      destination,
      tripType,
      departureDate,
      returnDate: tripType === 'round-trip' && returnDate ? returnDate : undefined,
      adults: passengers.adults,
      children: passengers.children,
      seatClass,
    });

    if (!result.success) {
      const flat = result.error.flatten();
      const fieldErrors = flat.fieldErrors as Record<string, string[]>;
      const formErrors = flat.formErrors;
      setErrors({
        origin: fieldErrors.origin?.[0],
        destination: fieldErrors.destination?.[0],
        departureDate: fieldErrors.departureDate?.[0],
        returnDate: fieldErrors.returnDate?.[0],
        adults: fieldErrors.adults?.[0],
        _form: formErrors[0],
      });
      return;
    }

    setErrors({});
    onSearch(result.data);
  }

  const isRoundTrip = tripType === 'round-trip';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Flight search"
      className="flex flex-col gap-5"
    >
      {/* Trip type toggle */}
      <fieldset>
        <legend className="sr-only">Trip type</legend>
        <div
          role="group"
          className="inline-flex bg-mist/50 rounded-xl p-1 gap-1"
          aria-label="Trip type"
        >
          {(['one-way', 'round-trip'] as const).map((type) => (
            <label
              key={type}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors select-none
                ${
                  tripType === type
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-slate hover:text-ink'
                }
              `}
            >
              <input
                type="radio"
                name="tripType"
                value={type}
                checked={tripType === type}
                onChange={() => {
                  setTripType(type);
                  if (type === 'one-way') setReturnDate('');
                }}
                className="sr-only"
              />
              {type === 'one-way' ? 'One way' : 'Round trip'}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Airport row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AirportCombobox
          label="From"
          value={origin}
          onChange={setOrigin}
          error={errors.origin}
          placeholder="City or airport"
          required
        />
        <AirportCombobox
          label="To"
          value={destination}
          onChange={setDestination}
          error={errors.destination}
          placeholder="City or airport"
          required
        />
      </div>

      {/* Date row */}
      <div className={`grid grid-cols-1 gap-4 ${isRoundTrip ? 'sm:grid-cols-2' : ''}`}>
        <div className="flex flex-col gap-1">
          <label htmlFor="departure-date" className="text-sm font-medium text-ink">
            Departure date <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
          </label>
          <input
            id="departure-date"
            type="date"
            value={departureDate}
            min={today()}
            onChange={(e) => setDepartureDate(e.target.value)}
            aria-invalid={errors.departureDate ? 'true' : undefined}
            className={`
              px-3 py-2.5 text-sm rounded-xl border bg-white text-ink
              focus:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:border-sky
              transition-colors
              ${errors.departureDate ? 'border-red-400 bg-red-50' : 'border-mist hover:border-sky/60'}
            `}
          />
          {errors.departureDate && (
            <p role="alert" className="text-xs text-red-500">{errors.departureDate}</p>
          )}
        </div>

        {isRoundTrip && (
          <div className="flex flex-col gap-1">
            <label htmlFor="return-date" className="text-sm font-medium text-ink">
              Return date <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
            </label>
            <input
              id="return-date"
              type="date"
              value={returnDate}
              min={departureDate || today()}
              onChange={(e) => setReturnDate(e.target.value)}
              aria-invalid={errors.returnDate ? 'true' : undefined}
              className={`
                px-3 py-2.5 text-sm rounded-xl border bg-white text-ink
                focus:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:border-sky
                transition-colors
                ${errors.returnDate ? 'border-red-400 bg-red-50' : 'border-mist hover:border-sky/60'}
              `}
            />
            {errors.returnDate && (
              <p role="alert" className="text-xs text-red-500">{errors.returnDate}</p>
            )}
          </div>
        )}
      </div>

      {/* Passengers + seat class row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PassengerPicker
          value={passengers}
          onChange={setPassengers}
          error={errors.adults}
        />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink">Seat class</span>
          <div className="flex gap-2">
            {SEAT_CLASSES.map(({ value: cls, label }) => (
              <label
                key={cls}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-colors
                  ${
                    seatClass === cls
                      ? 'border-sky bg-sky/10 text-sky'
                      : 'border-mist bg-white text-ink hover:border-sky/60'
                  }
                `}
              >
                <input
                  type="radio"
                  name="seatClass"
                  value={cls}
                  checked={seatClass === cls}
                  onChange={() => setSeatClass(cls)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {errors._form && (
        <Alert variant="error">{errors._form}</Alert>
      )}

      <Button type="submit" size="lg" className="w-full rounded-xl bg-sky hover:bg-sky/90 text-white border-0">
        Search flights
      </Button>
    </form>
  );
}
