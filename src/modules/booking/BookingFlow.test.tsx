import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { BookingFlow } from './BookingFlow';

const mockCreateBooking = vi.fn();
const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock('@shared/hooks', () => ({
  useBooking: () => ({
    createBooking: mockCreateBooking,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@modules/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'test@example.com', role: 'USER' },
    accessToken: 'tok-test',
    isRefreshing: false,
    login: vi.fn(),
    logout: mockLogout,
    register: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [
      new URLSearchParams('outboundFlightId=fl-001&passengers=1&seatClass=ECONOMY'),
    ],
  };
});

function renderFlow() {
  return render(
    <MemoryRouter>
      <BookingFlow />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLogout.mockResolvedValue(undefined);
});

describe('BookingFlow wizard', () => {
  it('starts on step 1 — Passenger details', () => {
    renderFlow();
    expect(screen.getByRole('heading', { name: /passenger details/i })).toBeInTheDocument();
  });

  it('step indicator shows Passengers as current step', () => {
    renderFlow();
    const nav = screen.getByRole('navigation', { name: /booking steps/i });
    const current = within(nav).getByRole('listitem', { current: 'step' as never });
    expect(current).toHaveTextContent('Passengers');
  });

  it('blocks advancing to step 2 when passenger fields are empty', async () => {
    const user = userEvent.setup();
    renderFlow();

    await user.click(screen.getByRole('button', { name: /continue to seat class/i }));

    // Should still be on step 1
    expect(screen.getByRole('heading', { name: /passenger details/i })).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('advances to step 2 after valid passenger details are entered', async () => {
    const user = userEvent.setup();
    renderFlow();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '1990-06-15');
    await user.type(screen.getByLabelText(/document number/i), 'AB1234567');

    await user.click(screen.getByRole('button', { name: /continue to seat class/i }));

    expect(await screen.findByRole('heading', { name: /choose seat class/i })).toBeInTheDocument();
  });

  it('can navigate back from step 2 to step 1', async () => {
    const user = userEvent.setup();
    renderFlow();

    // advance to step 2
    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '1990-06-15');
    await user.type(screen.getByLabelText(/document number/i), 'AB1234567');
    await user.click(screen.getByRole('button', { name: /continue to seat class/i }));
    await screen.findByRole('heading', { name: /choose seat class/i });

    // go back
    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(screen.getByRole('heading', { name: /passenger details/i })).toBeInTheDocument();
  });

  it('advances from step 2 to step 3 review', async () => {
    const user = userEvent.setup();
    renderFlow();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '1990-06-15');
    await user.type(screen.getByLabelText(/document number/i), 'AB1234567');
    await user.click(screen.getByRole('button', { name: /continue to seat class/i }));
    await screen.findByRole('heading', { name: /choose seat class/i });

    await user.click(screen.getByRole('button', { name: /review booking/i }));

    expect(await screen.findByRole('heading', { name: /review your booking/i })).toBeInTheDocument();
  });

  it('review step shows passenger name and outbound flight id', async () => {
    const user = userEvent.setup();
    renderFlow();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '1990-06-15');
    await user.type(screen.getByLabelText(/document number/i), 'AB1234567');
    await user.click(screen.getByRole('button', { name: /continue to seat class/i }));
    await screen.findByRole('heading', { name: /choose seat class/i });
    await user.click(screen.getByRole('button', { name: /review booking/i }));
    await screen.findByRole('heading', { name: /review your booking/i });

    expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
    expect(screen.getByText(/fl-001/)).toBeInTheDocument();
  });

  it('calls createBooking and navigates on confirm', async () => {
    const user = userEvent.setup();
    mockCreateBooking.mockResolvedValue({
      bookingId: 'bk-001',
      reference: 'MK123456',
      status: 'CONFIRMED',
      totalPricePence: 10000,
    });
    renderFlow();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '1990-06-15');
    await user.type(screen.getByLabelText(/document number/i), 'AB1234567');
    await user.click(screen.getByRole('button', { name: /continue to seat class/i }));
    await screen.findByRole('heading', { name: /choose seat class/i });
    await user.click(screen.getByRole('button', { name: /review booking/i }));
    await screen.findByRole('heading', { name: /review your booking/i });
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledOnce();
      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          outboundFlightId: 'fl-001',
          seatClass: 'ECONOMY',
          passengers: expect.arrayContaining([
            expect.objectContaining({ fullName: 'Jane Doe' }),
          ]),
        }),
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        '/booking/confirmation/MK123456',
        expect.any(Object),
      );
    });
  });
});
