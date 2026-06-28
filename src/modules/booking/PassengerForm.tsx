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
    <fieldset className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
      <legend className="text-sm font-semibold text-sky-400 px-1">
        Passenger {index + 1}
      </legend>

      <Input
        dark
        id={`${prefix}-name`}
        label="Full name"
        value={value.fullName}
        onChange={(e) => onChange({ ...value, fullName: e.target.value })}
        error={errors.fullName}
        autoComplete="name"
        required
      />

      <Input
        dark
        id={`${prefix}-dob`}
        label="Date of birth"
        type="date"
        value={value.dateOfBirth}
        onChange={(e) => onChange({ ...value, dateOfBirth: e.target.value })}
        error={errors.dateOfBirth}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${prefix}-doctype`} className="text-sm font-medium text-white/70">
          Document type <span className="text-red-400 ml-1" aria-hidden="true">*</span>
        </label>
        <select
          id={`${prefix}-doctype`}
          value={value.documentType}
          onChange={(e) =>
            onChange({ ...value, documentType: e.target.value as PassengerDTO['documentType'] })
          }
          className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400 transition-colors"
          aria-required="true"
        >
          <option value="PASSPORT" className="bg-slate-800">Passport</option>
          <option value="ID_CARD" className="bg-slate-800">ID Card</option>
        </select>
      </div>

      <Input
        dark
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
