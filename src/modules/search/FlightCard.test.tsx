import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlightCard } from './FlightCard';
import type { FlightOption } from '@shared/hooks';

const baseFlight: FlightOption = {
  id: 'fl-001',
  flightNumber: 'SK451',
  origin: { iataCode: 'LHR', city: 'London' },
  destination: { iataCode: 'ARN', city: 'Stockholm' },
  departureAt: '2026-05-20T10:00:00Z',
  arrivalAt: '2026-05-20T13:30:00Z',
  durationMinutes: 210,
  availableSeats: 42,
  farePerPassenger: {
    baseFarePence: 7500,
    taxesPence: 2500,
    totalPence: 10000,
    currency: 'GBP',
  },
};

describe('FlightCard', () => {
  it('renders flight number and route', () => {
    render(<FlightCard flight={baseFlight} onSelect={vi.fn()} />);
    expect(screen.getByText('SK451')).toBeInTheDocument();
    // city names are rendered in separate elements; assert via the article's aria-label
    expect(screen.getByRole('article', { name: /flight SK451 from London to Stockholm/i })).toBeInTheDocument();
  });

  it('renders formatted prices in GBP', () => {
    render(<FlightCard flight={baseFlight} onSelect={vi.fn()} />);
    expect(screen.getByText('£75.00')).toBeInTheDocument(); // base fare
    expect(screen.getByText('£25.00')).toBeInTheDocument(); // taxes
    expect(screen.getByText('£100.00')).toBeInTheDocument(); // total
  });

  it('renders IATA codes', () => {
    render(<FlightCard flight={baseFlight} onSelect={vi.fn()} />);
    expect(screen.getByText('LHR')).toBeInTheDocument();
    expect(screen.getByText('ARN')).toBeInTheDocument();
  });

  it('renders formatted duration', () => {
    render(<FlightCard flight={baseFlight} onSelect={vi.fn()} />);
    expect(screen.getByText('3h 30m')).toBeInTheDocument();
  });

  it('calls onSelect with the flight when Select button clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<FlightCard flight={baseFlight} onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /select/i }));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(baseFlight);
  });

  it('shows Selected state when selected=true', () => {
    render(<FlightCard flight={baseFlight} selected onSelect={vi.fn()} />);
    const button = screen.getByRole('button', { name: /selected/i });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveTextContent('Selected');
  });

  it('does not show low-seat badge when seats > 5', () => {
    render(<FlightCard flight={baseFlight} onSelect={vi.fn()} />);
    expect(screen.queryByText(/seat.*left/i)).not.toBeInTheDocument();
  });

  it('shows low-seat warning badge when availableSeats <= 5', () => {
    const lowSeatFlight = { ...baseFlight, availableSeats: 3 };
    render(<FlightCard flight={lowSeatFlight} onSelect={vi.fn()} />);
    expect(screen.getByText('3 seats left')).toBeInTheDocument();
  });

  it('shows singular "seat" when only 1 seat available', () => {
    const lastSeatFlight = { ...baseFlight, availableSeats: 1 };
    render(<FlightCard flight={lastSeatFlight} onSelect={vi.fn()} />);
    expect(screen.getByText('1 seat left')).toBeInTheDocument();
  });

  it('has accessible article label', () => {
    render(<FlightCard flight={baseFlight} onSelect={vi.fn()} />);
    expect(
      screen.getByRole('article', { name: /flight SK451 from London to Stockholm/i }),
    ).toBeInTheDocument();
  });

  it('renders a fare breakdown with dt/dd pairs', () => {
    render(<FlightCard flight={baseFlight} onSelect={vi.fn()} />);
    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.getByText('Taxes')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});
