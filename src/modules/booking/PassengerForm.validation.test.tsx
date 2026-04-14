import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PassengerForm, passengerSchema } from './PassengerForm';
import type { PassengerDTO } from '@shared/hooks';

const valid = {
  fullName: 'Emma Johansson',
  dateOfBirth: '1996-04-15',
  documentType: 'PASSPORT' as const,
  documentNumber: 'AB123456',
};

describe('passengerSchema validation', () => {
  it('accepts a fully valid passenger', () => {
    expect(passengerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects full name shorter than 2 characters', () => {
    const result = passengerSchema.safeParse({ ...valid, fullName: 'A' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.fullName).toBeDefined();
    }
  });

  it('rejects empty date of birth', () => {
    const result = passengerSchema.safeParse({ ...valid, dateOfBirth: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.dateOfBirth).toBeDefined();
    }
  });

  it('rejects empty document number', () => {
    const result = passengerSchema.safeParse({ ...valid, documentNumber: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.documentNumber).toBeDefined();
    }
  });

  it('accepts ID_CARD as document type', () => {
    const result = passengerSchema.safeParse({ ...valid, documentType: 'ID_CARD' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid document type', () => {
    const result = passengerSchema.safeParse({ ...valid, documentType: 'DRIVING_LICENCE' });
    expect(result.success).toBe(false);
  });
});

describe('PassengerForm component', () => {
  const defaultValue: PassengerDTO = {
    fullName: 'Emma Johansson',
    dateOfBirth: '1996-04-15',
    documentType: 'PASSPORT',
    documentNumber: 'AB123456',
  };

  it('renders all passenger fields', () => {
    render(
      <PassengerForm
        index={0}
        value={defaultValue}
        errors={{}}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/document type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/document number/i)).toBeInTheDocument();
  });

  it('displays a field error when provided', () => {
    render(
      <PassengerForm
        index={0}
        value={defaultValue}
        errors={{ fullName: 'Name is too short' }}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Name is too short');
  });

  it('calls onChange when full name is updated', async () => {
    const onChange = vi.fn();
    render(
      <PassengerForm
        index={0}
        value={{ ...defaultValue, fullName: '' }}
        errors={{}}
        onChange={onChange}
      />,
    );
    await userEvent.type(screen.getByLabelText(/full name/i), 'J');
    expect(onChange).toHaveBeenCalled();
  });
});
