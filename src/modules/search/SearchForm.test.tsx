import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchForm, type SearchFormValues } from './SearchForm';

const FUTURE_DATE = '2099-06-20';
const FUTURE_RETURN = '2099-06-25';
const PAST_DATE = '2000-01-01';

function renderForm(onSearch = vi.fn()) {
  render(<SearchForm onSearch={onSearch} />);
  return { onSearch };
}

// The From/To comboboxes are the first and second role="combobox" inputs.
function getFromInput() {
  return screen.getAllByRole('combobox')[0]!;
}
function getToInput() {
  return screen.getAllByRole('combobox')[1]!;
}

// Passenger picker button — aria-label is "Passengers: 1 adult" by default.
function getPassengerButton() {
  return screen.getByRole('button', { name: /^passengers:/i });
}

describe('SearchForm component', () => {
  it('renders all required fields', () => {
    renderForm();
    const combos = screen.getAllByRole('combobox');
    expect(combos).toHaveLength(2);
    expect(screen.getByLabelText(/departure date/i)).toBeInTheDocument();
    expect(getPassengerButton()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search flights/i })).toBeInTheDocument();
  });

  it('has accessible form label', () => {
    renderForm();
    expect(screen.getByRole('form', { name: /flight search/i })).toBeInTheDocument();
  });

  it('trip type toggle defaults to one-way and hides return date', () => {
    renderForm();
    expect(screen.queryByLabelText(/return date/i)).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /one way/i })).toBeChecked();
  });

  it('switching to round-trip reveals the return date field', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('radio', { name: /round trip/i }));
    expect(screen.getByLabelText(/return date/i)).toBeInTheDocument();
  });

  it('does not call onSearch when validation fails (empty fields)', async () => {
    const user = userEvent.setup();
    const { onSearch } = renderForm();
    await user.click(screen.getByRole('button', { name: /search flights/i }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('shows validation error when origin equals destination', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    // Pre-populate both origin and destination to the same IATA via initialValues.
    render(
      <SearchForm
        onSearch={onSearch}
        initialValues={{ origin: 'ARN', destination: 'ARN', departureDate: FUTURE_DATE, adults: 1, children: 0, seatClass: 'ECONOMY', tripType: 'one-way' }}
      />,
    );
    await user.click(screen.getByRole('button', { name: /search flights/i }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(
      screen.getAllByText(/origin and destination must be different/i).length,
    ).toBeGreaterThan(0);
  });

  it('shows validation error when departure date is in the past', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <SearchForm
        onSearch={onSearch}
        initialValues={{ origin: 'LHR', destination: 'ARN', departureDate: PAST_DATE, adults: 1, children: 0, seatClass: 'ECONOMY', tripType: 'one-way' }}
      />,
    );
    await user.click(screen.getByRole('button', { name: /search flights/i }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(
      screen.getAllByText(/departure date must be today or in the future/i).length,
    ).toBeGreaterThan(0);
  });

  it('shows validation error when round-trip return date is before departure', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('radio', { name: /round trip/i }));
    await user.type(getFromInput(), 'LHR');
    await user.type(getToInput(), 'ARN');
    await user.type(screen.getByLabelText(/departure date/i), FUTURE_DATE);
    await user.type(screen.getByLabelText(/return date/i), PAST_DATE);
    await user.click(screen.getByRole('button', { name: /search flights/i }));

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/return date must be after departure date/i).length,
    ).toBeGreaterThan(0);
  });

  it('seat class toggle buttons are present', () => {
    renderForm();
    expect(screen.getByRole('radio', { name: /economy/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /business/i })).toBeInTheDocument();
  });

  it('seat class defaults to economy', () => {
    renderForm();
    expect(screen.getByRole('radio', { name: /economy/i })).toBeChecked();
  });

  it('selecting Business seat class is reflected in initialValues', () => {
    render(
      <SearchForm
        onSearch={vi.fn()}
        initialValues={{ seatClass: 'BUSINESS', adults: 1, children: 0, tripType: 'one-way' }}
      />,
    );
    expect(screen.getByRole('radio', { name: /business/i })).toBeChecked();
  });

  it('pre-populates departure date and seat class from initialValues', () => {
    render(
      <SearchForm
        onSearch={vi.fn()}
        initialValues={{
          origin: 'OSL',
          destination: 'CPH',
          departureDate: FUTURE_RETURN,
          adults: 2,
          children: 1,
          seatClass: 'BUSINESS',
          tripType: 'one-way',
        }}
      />,
    );
    expect(screen.getByLabelText(/departure date/i)).toHaveValue(FUTURE_RETURN);
    expect(screen.getByRole('radio', { name: /business/i })).toBeChecked();
  });

  it('passenger picker button shows default adult count', () => {
    renderForm();
    expect(getPassengerButton()).toHaveAttribute('aria-label', 'Passengers: 1 adult');
  });

  it('passenger picker button reflects updated counts', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(getPassengerButton());
    const dialog = screen.getByRole('dialog', { name: /select passengers/i });
    await user.click(within(dialog).getByRole('button', { name: /add children/i }));

    // aria-label on the trigger button should update
    expect(getPassengerButton()).toHaveAttribute('aria-label', 'Passengers: 1 adult, 1 child');
  });

  it('calls onSearch with correct values when initialValues provides all fields', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <SearchForm
        onSearch={onSearch}
        initialValues={{
          origin: 'LHR',
          destination: 'ARN',
          departureDate: FUTURE_DATE,
          adults: 1,
          children: 0,
          seatClass: 'ECONOMY',
          tripType: 'one-way',
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /search flights/i }));

    expect(onSearch).toHaveBeenCalledOnce();
    const call = onSearch.mock.calls[0]![0] as SearchFormValues;
    expect(call.origin).toBe('LHR');
    expect(call.destination).toBe('ARN');
    expect(call.tripType).toBe('one-way');
    expect(call.adults).toBe(1);
    expect(call.children).toBe(0);
    expect(call.seatClass).toBe('ECONOMY');
  });
});
