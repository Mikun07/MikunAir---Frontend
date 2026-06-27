import { useEffect, useReducer, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { PassengerDTO } from '@shared/hooks';
import { useBooking } from '@shared/hooks';
import { Alert, Button, Card, ProgressBar } from '@shared/ui';
import { formatPrice } from '@shared/utils';
import type { PassengerErrors } from './PassengerForm';
import { PassengerForm, passengerSchema } from './PassengerForm';

type SeatClass = 'ECONOMY' | 'BUSINESS';

interface WizardState {
  step: 1 | 2 | 3;
  passengers: PassengerDTO[];
  seatClass: SeatClass;
  passengerErrors: PassengerErrors[];
}

type WizardAction =
  | { type: 'SET_STEP'; step: 1 | 2 | 3 }
  | { type: 'UPDATE_PASSENGER'; index: number; value: PassengerDTO }
  | { type: 'SET_SEAT_CLASS'; seatClass: SeatClass }
  | { type: 'SET_PASSENGER_ERRORS'; errors: PassengerErrors[] };

function emptyPassenger(): PassengerDTO {
  return { fullName: '', dateOfBirth: '', documentType: 'PASSPORT', documentNumber: '' };
}

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'UPDATE_PASSENGER': {
      const passengers = [...state.passengers];
      passengers[action.index] = action.value;
      return { ...state, passengers };
    }
    case 'SET_SEAT_CLASS':
      return { ...state, seatClass: action.seatClass };
    case 'SET_PASSENGER_ERRORS':
      return { ...state, passengerErrors: action.errors };
    default:
      return state;
  }
}

const PRICE_PER_CLASS: Record<SeatClass, number> = {
  ECONOMY: 0,
  BUSINESS: 5000,
};

export function BookingFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { createBooking, isLoading, error: bookingError } = useBooking();
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  const outboundFlightId = searchParams.get('outboundFlightId') ?? '';
  const inboundFlightId = searchParams.get('inboundFlightId') ?? undefined;
  const passengerCount = Number(searchParams.get('passengers') ?? '1');
  const initialSeatClass = (searchParams.get('seatClass') as SeatClass | null) ?? 'ECONOMY';

  const [state, dispatch] = useReducer(reducer, {
    step: 1,
    passengers: Array.from({ length: passengerCount }, emptyPassenger),
    seatClass: initialSeatClass,
    passengerErrors: Array.from({ length: passengerCount }, () => ({})),
  });

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [state.step]);

  function validatePassengers(): boolean {
    const errors = state.passengers.map((p) => {
      const result = passengerSchema.safeParse(p);
      if (result.success) return {};
      const flat = result.error.flatten().fieldErrors;
      return {
        fullName: flat.fullName?.[0],
        dateOfBirth: flat.dateOfBirth?.[0],
        documentType: flat.documentType?.[0],
        documentNumber: flat.documentNumber?.[0],
      } as PassengerErrors;
    });
    dispatch({ type: 'SET_PASSENGER_ERRORS', errors });
    return errors.every((e) => Object.values(e).every((v) => !v));
  }

  function goToStep2() {
    if (validatePassengers()) {
      dispatch({ type: 'SET_STEP', step: 2 });
    }
  }

  async function handleConfirm() {
    try {
      const result = await createBooking({
        outboundFlightId,
        inboundFlightId,
        seatClass: state.seatClass,
        passengers: state.passengers,
      });
      navigate(`/booking/confirmation/${result.reference}`, {
        state: { totalPricePence: result.totalPricePence, reference: result.reference },
        replace: true,
      });
    } catch {
      // error surfaced via bookingError
    }
  }

  const steps = ['Passengers', 'Seat class', 'Review'] as const;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Step indicator */}
        <nav aria-label="Booking steps">
          <ol className="flex gap-2">
            {steps.map((label, i) => {
              const stepNum = (i + 1) as 1 | 2 | 3;
              const isCurrent = state.step === stepNum;
              const isDone = state.step > stepNum;
              return (
                <li
                  key={label}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`flex-1 text-center py-2 rounded text-sm font-medium border ${
                    isCurrent
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : isDone
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  {label}
                </li>
              );
            })}
          </ol>
        </nav>

        <ProgressBar
          value={state.step}
          max={3}
          label={`Step ${state.step} of 3`}
          showLabel
        />

        <Card>
          {/* Step 1 — Passengers */}
          {state.step === 1 && (
            <section aria-labelledby="step-heading">
              <h1
                id="step-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
                className="text-xl font-bold text-gray-900 mb-4 focus:outline-none"
              >
                Passenger details
              </h1>
              <div className="flex flex-col gap-4">
                {state.passengers.map((p, i) => (
                  <PassengerForm
                    key={i}
                    index={i}
                    value={p}
                    errors={state.passengerErrors[i] ?? {}}
                    onChange={(updated) =>
                      dispatch({ type: 'UPDATE_PASSENGER', index: i, value: updated })
                    }
                  />
                ))}
              </div>
              <Button className="mt-6 w-full sm:w-auto" onClick={goToStep2}>
                Continue to seat class
              </Button>
            </section>
          )}

          {/* Step 2 — Seat class */}
          {state.step === 2 && (
            <section aria-labelledby="step-heading">
              <h1
                id="step-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
                className="text-xl font-bold text-gray-900 mb-4 focus:outline-none"
              >
                Choose seat class
              </h1>
              <fieldset className="flex flex-col gap-3">
                <legend className="sr-only">Seat class</legend>
                {(['ECONOMY', 'BUSINESS'] as const).map((cls) => (
                  <label
                    key={cls}
                    className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer ${
                      state.seatClass === cls ? 'border-blue-700 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="seatClass"
                        value={cls}
                        checked={state.seatClass === cls}
                        onChange={() => dispatch({ type: 'SET_SEAT_CLASS', seatClass: cls })}
                        className="accent-blue-700"
                      />
                      <span className="font-medium text-gray-900">
                        {cls.charAt(0) + cls.slice(1).toLowerCase()}
                      </span>
                    </div>
                    {PRICE_PER_CLASS[cls] > 0 && (
                      <span className="text-sm text-gray-500">
                        +{formatPrice(PRICE_PER_CLASS[cls])} per passenger
                      </span>
                    )}
                  </label>
                ))}
              </fieldset>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
                >
                  Back
                </Button>
                <Button onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}>
                  Review booking
                </Button>
              </div>
            </section>
          )}

          {/* Step 3 — Review */}
          {state.step === 3 && (
            <section aria-labelledby="step-heading">
              <h1
                id="step-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
                className="text-xl font-bold text-gray-900 mb-4 focus:outline-none"
              >
                Review your booking
              </h1>

              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Flights
                  </h2>
                  <p className="text-sm text-gray-700">Outbound flight ID: {outboundFlightId}</p>
                  {inboundFlightId && (
                    <p className="text-sm text-gray-700">Return flight ID: {inboundFlightId}</p>
                  )}
                  <p className="text-sm text-gray-700 mt-1">
                    Seat class:{' '}
                    <strong>
                      {state.seatClass.charAt(0) + state.seatClass.slice(1).toLowerCase()}
                    </strong>
                  </p>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Passengers
                  </h2>
                  <ul className="flex flex-col gap-1">
                    {state.passengers.map((p, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        {i + 1}. {p.fullName}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {bookingError && (
                <div className="mb-4">
                  <Alert variant="error">{bookingError}</Alert>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}
                >
                  Back
                </Button>
                <Button loading={isLoading} onClick={() => void handleConfirm()}>
                  Confirm booking
                </Button>
              </div>
            </section>
          )}
        </Card>
      </div>
    </main>
  );
}
