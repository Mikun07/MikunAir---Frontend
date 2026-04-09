import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchForm, type SearchFormValues } from './SearchForm';

// Use a fixed far-future date so departure date tests always pass relative to today.
const FUTURE_DATE = '2099-06-20';
const FUTURE_RETURN = '2099-06-25';
const PAST_DATE = '2000-01-01';

function renderForm(onSearch = vi.fn()) {
  render(<SearchForm onSearch={onSearch} />);
  return { onSearch };
}

describe('SearchForm component', () => {
  it('renders all required fields', () => {
    renderForm();
    expect(screen.getByLabelText(/from \(iata\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to \(iata\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/departure date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/return date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passengers/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search flights/i })).toBeInTheDocument();
  });

  it('has accessible form label', () => {
    renderForm();
    expect(screen.getByRole('form', { name: /flight search/i })).toBeInTheDocument();
  });

  it('calls onSearch with correct values on valid submit', async () => {
    const user = userEvent.setup();
    const { onSearch } = renderForm();

    await user.clear(screen.getByLabelText(/from \(iata\)/i));
    await user.type(screen.getByLabelText(/from \(iata\)/i), 'LHR');
    await user.clear(screen.getByLabelText(/to \(iata\)/i));
    await user.type(screen.getByLabelText(/to \(iata\)/i), 'ARN');
    await user.type(screen.getByLabelText(/departure date/i), FUTURE_DATE);

    await user.click(screen.getByRole('button', { name: /search flights/i }));

    expect(onSearch).toHaveBeenCalledOnce();
    const call = onSearch.mock.calls[0][0] as SearchFormValues;
    expect(call.origin).toBe('LHR');
    expect(call.destination).toBe('ARN');
    expect(call.departureDate).toBe(FUTURE_DATE);
    expect(call.seatClass).toBe('ECONOMY');
    expect(call.passengers).toBe(1);
  });

  it('shows validation error when origin equals destination', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/from \(iata\)/i), 'ARN');
    await user.type(screen.getByLabelText(/to \(iata\)/i), 'ARN');
    await user.type(screen.getByLabelText(/departure date/i), FUTURE_DATE);
    await user.click(screen.getByRole('button', { name: /search flights/i }));

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/origin and destination must be different/i).length).toBeGreaterThan(0);
  });

  it('shows validation error when departure date is in the past', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/from \(iata\)/i), 'LHR');
    await user.type(screen.getByLabelText(/to \(iata\)/i), 'ARN');
    await user.type(screen.getByLabelText(/departure date/i), PAST_DATE);
    await user.click(screen.getByRole('button', { name: /search flights/i }));

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/departure date must be in the future/i).length).toBeGreaterThan(0);
  });

  it('shows validation error when return date is before departure', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/from \(iata\)/i), 'LHR');
    await user.type(screen.getByLabelText(/to \(iata\)/i), 'ARN');
    await user.type(screen.getByLabelText(/departure date/i), FUTURE_DATE);
    await user.type(screen.getByLabelText(/return date/i), PAST_DATE);
    await user.click(screen.getByRole('button', { name: /search flights/i }));

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/return date must be after departure date/i).length).toBeGreaterThan(0);
  });

  it('does not call onSearch when validation fails', async () => {
    const user = userEvent.setup();
    const { onSearch } = renderForm();

    // Submit with empty fields — IATA codes will be empty strings, which fail
    await user.click(screen.getByRole('button', { name: /search flights/i }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('seat class radio buttons are accessible as a group', () => {
    renderForm();
    const fieldset = screen.getByRole('group', { name: /seat class/i });
    expect(within(fieldset).getByLabelText(/economy/i)).toBeInTheDocument();
    expect(within(fieldset).getByLabelText(/business/i)).toBeInTheDocument();
  });

  it('selecting BUSINESS seat class passes it to onSearch', async () => {
    const user = userEvent.setup();
    const { onSearch } = renderForm();

    await user.type(screen.getByLabelText(/from \(iata\)/i), 'LHR');
    await user.type(screen.getByLabelText(/to \(iata\)/i), 'ARN');
    await user.type(screen.getByLabelText(/departure date/i), FUTURE_DATE);
    await user.click(screen.getByLabelText(/business/i));
    await user.click(screen.getByRole('button', { name: /search flights/i }));

    expect(onSearch).toHaveBeenCalledOnce();
    const call = onSearch.mock.calls[0][0] as SearchFormValues;
    expect(call.seatClass).toBe('BUSINESS');
  });

  it('pre-populates fields from initialValues', () => {
    render(
      <SearchForm
        onSearch={vi.fn()}
        initialValues={{
          origin: 'OSL',
          destination: 'CPH',
          departureDate: FUTURE_RETURN,
          passengers: 2,
          seatClass: 'BUSINESS',
        }}
      />,
    );

    expect(screen.getByLabelText(/from \(iata\)/i)).toHaveValue('OSL');
    expect(screen.getByLabelText(/to \(iata\)/i)).toHaveValue('CPH');
    expect(screen.getByLabelText(/departure date/i)).toHaveValue(FUTURE_RETURN);
    expect(screen.getByLabelText(/passengers/i)).toHaveValue('2');
    expect(screen.getByLabelText(/business/i)).toBeChecked();
  });

  it('accepts a valid return date after departure', async () => {
    const user = userEvent.setup();
    const { onSearch } = renderForm();

    await user.type(screen.getByLabelText(/from \(iata\)/i), 'LHR');
    await user.type(screen.getByLabelText(/to \(iata\)/i), 'ARN');
    await user.type(screen.getByLabelText(/departure date/i), FUTURE_DATE);
    await user.type(screen.getByLabelText(/return date/i), FUTURE_RETURN);
    await user.click(screen.getByRole('button', { name: /search flights/i }));

    expect(onSearch).toHaveBeenCalledOnce();
    const call = onSearch.mock.calls[0][0] as SearchFormValues;
    expect(call.returnDate).toBe(FUTURE_RETURN);
  });
});
