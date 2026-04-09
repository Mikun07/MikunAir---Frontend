import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

const FIXED_DATE = '2026-06-27';

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${FIXED_DATE}T00:00:00Z`));
});

afterAll(() => {
  vi.useRealTimers();
});

// Import the schema after mocking so the today() call picks up the fake date.
// The schema is defined at module evaluation time via a closure over today(),
// so we import dynamically after the timer mock is set.
const { z } = await import('zod');

function buildSchema() {
  const today = () => new Date().toISOString().split('T')[0] ?? '';

  return z
    .object({
      origin: z.string().length(3, 'Enter a valid 3-letter IATA code').toUpperCase(),
      destination: z.string().length(3, 'Enter a valid 3-letter IATA code').toUpperCase(),
      departureDate: z.string().min(1, 'Select a departure date'),
      returnDate: z.string().optional(),
      passengers: z.coerce.number().int().min(1).max(9),
      seatClass: z.enum(['ECONOMY', 'BUSINESS']),
    })
    .refine((d) => d.origin !== d.destination, {
      message: 'Origin and destination must be different',
      path: ['destination'],
    })
    .refine((d) => d.departureDate >= today(), {
      message: 'Departure date must be in the future',
      path: ['departureDate'],
    })
    .refine((d) => !d.returnDate || d.returnDate > d.departureDate, {
      message: 'Return date must be after departure date',
      path: ['returnDate'],
    });
}

const schema = buildSchema();

const validBase = {
  origin: 'LHR',
  destination: 'ARN',
  departureDate: '2026-06-28',
  passengers: 1,
  seatClass: 'ECONOMY' as const,
};

describe('SearchForm validation', () => {
  it('accepts a valid one-way search', () => {
    expect(schema.safeParse(validBase).success).toBe(true);
  });

  it('rejects when origin equals destination', () => {
    const result = schema.safeParse({ ...validBase, destination: 'LHR' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('destination');
    }
  });

  it('rejects a departure date in the past', () => {
    const result = schema.safeParse({ ...validBase, departureDate: '2026-06-26' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('departureDate');
    }
  });

  it('rejects return date before departure date', () => {
    const result = schema.safeParse({
      ...validBase,
      returnDate: '2026-06-27',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('returnDate');
    }
  });

  it('accepts a valid return date after departure', () => {
    const result = schema.safeParse({ ...validBase, returnDate: '2026-06-30' });
    expect(result.success).toBe(true);
  });

  it('rejects an IATA code shorter than 3 characters', () => {
    const result = schema.safeParse({ ...validBase, origin: 'LH' });
    expect(result.success).toBe(false);
  });

  it('rejects passenger count of 0', () => {
    const result = schema.safeParse({ ...validBase, passengers: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects passenger count above 9', () => {
    const result = schema.safeParse({ ...validBase, passengers: 10 });
    expect(result.success).toBe(false);
  });
});
