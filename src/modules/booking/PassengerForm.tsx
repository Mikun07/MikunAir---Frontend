import { z } from 'zod';
import { Input } from '@shared/ui';
import type { PassengerDTO } from '@shared/hooks';

export const passengerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  documentType: z.enum(['PASSPORT', 'ID_CARD']),
  documentNumber: z.string().min(1, 'Document number is required'),
});

export type PassengerErrors = Partial<Record<keyof PassengerDTO, string>>;

interface PassengerFormProps {
  index: number;
  value: PassengerDTO;
  errors: PassengerErrors;
  onChange: (updated: PassengerDTO) => void;
}

export function PassengerForm({ index, value, errors, onChange }: PassengerFormProps) {
  const prefix = `passenger-${index}`;

  return (
    <fieldset className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      <legend className="text-sm font-semibold text-gray-700 px-1">
        Passenger {index + 1}
      </legend>

      <Input
        id={`${prefix}-name`}
        label="Full name"
        value={value.fullName}
        onChange={(e) => onChange({ ...value, fullName: e.target.value })}
        error={errors.fullName}
        autoComplete="name"
        required
      />

      <Input
        id={`${prefix}-dob`}
        label="Date of birth"
        type="date"
        value={value.dateOfBirth}
        onChange={(e) => onChange({ ...value, dateOfBirth: e.target.value })}
        error={errors.dateOfBirth}
        required
      />

      <div className="flex flex-col gap-1">
        <label htmlFor={`${prefix}-doctype`} className="text-sm font-medium text-gray-700">
          Document type <span className="text-red-600 ml-1" aria-hidden="true">*</span>
        </label>
        <select
          id={`${prefix}-doctype`}
          value={value.documentType}
          onChange={(e) =>
            onChange({ ...value, documentType: e.target.value as PassengerDTO['documentType'] })
          }
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          aria-required="true"
        >
          <option value="PASSPORT">Passport</option>
          <option value="ID_CARD">ID Card</option>
        </select>
      </div>

      <Input
        id={`${prefix}-docnum`}
        label="Document number"
        value={value.documentNumber}
        onChange={(e) => onChange({ ...value, documentNumber: e.target.value })}
        error={errors.documentNumber}
        required
      />
    </fieldset>
  );
}
