import { useEffect, useReducer, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { PassengerDTO } from '@shared/hooks';
import { useBooking } from '@shared/hooks';
import { useAuth } from '@modules/auth/AuthContext';
import { Alert, Spinner } from '@shared/ui';
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

const STEPS = ['Passengers', 'Seat class', 'Review'] as const;

const SEAT_CLASS_UPGRADE_PENCE: Record<SeatClass, number> = {
  ECONOMY: 0,
  BUSINESS: 5000,
};

export function BookingFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
    if (validatePassengers()) dispatch({ type: 'SET_STEP', step: 2 });
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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
    >
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-slate-900/60">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" aria-label="MikunAir home">
            <MikunAirWordmark />
          </Link>
          <nav className="flex items-center gap-1">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  My bookings
                </Link>
                <button
                  type="button"
                  onClick={() => { void logout().then(() => navigate('/auth/login')); }}
                  className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          {/* Step indicator */}
          <nav aria-label="Booking steps">
            <ol className="flex gap-2">
              {STEPS.map((label, i) => {
                const stepNum = (i + 1) as 1 | 2 | 3;
                const isCurrent = state.step === stepNum;
                const isDone = state.step > stepNum;
                return (
                  <li
                    key={label}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      isCurrent
                        ? 'border-sky-500 bg-sky-500/20 text-sky-300'
                        : isDone
                        ? 'border-sky-500/30 bg-sky-500/10 text-sky-400/60'
                        : 'border-white/10 bg-white/5 text-white/25'
                    }`}
                  >
                    {label}
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Step content */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">

            {/* Step 1 — Passengers */}
            {state.step === 1 && (
              <section aria-labelledby="step-heading">
                <h1
                  id="step-heading"
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="text-xl font-bold text-white mb-6 focus:outline-none"
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
                <button
                  type="button"
                  onClick={goToStep2}
                  className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  Continue to seat class
                </button>
              </section>
            )}

            {/* Step 2 — Seat class */}
            {state.step === 2 && (
              <section aria-labelledby="step-heading">
                <h1
                  id="step-heading"
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="text-xl font-bold text-white mb-6 focus:outline-none"
                >
                  Choose seat class
                </h1>
                <fieldset className="flex flex-col gap-3">
                  <legend className="sr-only">Seat class</legend>
                  {(['ECONOMY', 'BUSINESS'] as const).map((cls) => (
                    <label
                      key={cls}
                      className={`flex items-center justify-between border rounded-2xl p-4 cursor-pointer transition-colors ${
                        state.seatClass === cls
                          ? 'border-sky-500/60 bg-sky-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="seatClass"
                          value={cls}
                          checked={state.seatClass === cls}
                          onChange={() => dispatch({ type: 'SET_SEAT_CLASS', seatClass: cls })}
                          className="accent-sky-500"
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {cls.charAt(0) + cls.slice(1).toLowerCase()}
                          </p>
                          {cls === 'BUSINESS' && (
                            <p className="text-xs text-white/40 mt-0.5">Priority boarding · Extra legroom</p>
                          )}
                          {cls === 'ECONOMY' && (
                            <p className="text-xs text-white/40 mt-0.5">Standard seating</p>
                          )}
                        </div>
                      </div>
                      {SEAT_CLASS_UPGRADE_PENCE[cls] > 0 && (
                        <span className="text-sm text-sky-400 font-medium">
                          +{formatPrice(SEAT_CLASS_UPGRADE_PENCE[cls])} / pax
                        </span>
                      )}
                      {SEAT_CLASS_UPGRADE_PENCE[cls] === 0 && (
                        <span className="text-sm text-white/30">Included</span>
                      )}
                    </label>
                  ))}
                </fieldset>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    Review booking
                  </button>
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
                  className="text-xl font-bold text-white mb-6 focus:outline-none"
                >
                  Review your booking
                </h1>

                <div className="flex flex-col gap-4 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
                      Flights
                    </h2>
                    <p className="text-sm text-white/70">
                      Outbound flight:{' '}
                      <span className="font-mono text-sky-400">{outboundFlightId}</span>
                    </p>
                    {inboundFlightId && (
                      <p className="text-sm text-white/70">
                        Return flight:{' '}
                        <span className="font-mono text-sky-400">{inboundFlightId}</span>
                      </p>
                    )}
                    <p className="text-sm text-white/70">
                      Seat class:{' '}
                      <strong className="text-white">
                        {state.seatClass.charAt(0) + state.seatClass.slice(1).toLowerCase()}
                      </strong>
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
                      Passengers
                    </h2>
                    <ul className="flex flex-col gap-1">
                      {state.passengers.map((p, i) => (
                        <li key={i} className="text-sm text-white/70">
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
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => void handleConfirm()}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 flex items-center gap-2"
                  >
                    {isLoading && <Spinner size="sm" />}
                    Confirm booking
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-6">
        <p className="text-center text-xs text-white/20">
          © 2026 MikunAir. Portfolio project by Festus-Olaleye Ayomikun.
        </p>
      </footer>
    </div>
  );
}
