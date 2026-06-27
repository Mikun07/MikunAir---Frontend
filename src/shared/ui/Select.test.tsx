import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

const OPTIONS = [
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
];

function renderSelect(props: Partial<Parameters<typeof Select>[0]> = {}) {
  const defaults = { label: 'Cabin class', options: OPTIONS, onChange: vi.fn() };
  return { onChange: defaults.onChange, ...render(<Select {...defaults} {...props} />) };
}

describe('Select', () => {
  it('renders a labelled select with all options', () => {
    renderSelect();
    const select = screen.getByRole('combobox', { name: /cabin class/i });
    expect(select).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('derives id from label when no id prop supplied', () => {
    renderSelect({ label: 'Cabin class' });
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'cabin-class');
  });

  it('uses provided id over derived one', () => {
    renderSelect({ id: 'custom-id' });
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'custom-id');
  });

  it('renders hint text when hint prop is provided', () => {
    renderSelect({ hint: 'Choose your preferred cabin' });
    expect(screen.getByText('Choose your preferred cabin')).toBeInTheDocument();
  });

  it('renders error message with role="alert" when error prop is provided', () => {
    renderSelect({ error: 'Please select a cabin class' });
    expect(screen.getByRole('alert')).toHaveTextContent('Please select a cabin class');
  });

  it('sets aria-invalid when error is present', () => {
    renderSelect({ error: 'Required' });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    renderSelect();
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
  });

  it('sets aria-describedby to include error id when error present', () => {
    renderSelect({ label: 'Cabin class', error: 'Required' });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-describedby', 'cabin-class-error');
  });

  it('sets aria-describedby to include hint id when hint present', () => {
    renderSelect({ label: 'Cabin class', hint: 'Pick one' });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-describedby', 'cabin-class-hint');
  });

  it('shows required asterisk when required prop is set', () => {
    renderSelect({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange when user selects an option', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect();
    await user.selectOptions(screen.getByRole('combobox'), 'business');
    expect(onChange).toHaveBeenCalled();
  });
});
