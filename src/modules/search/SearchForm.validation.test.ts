import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

const FIXED_DATE = '2026-06-27';

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${FIXED_DATE}T00:00:00Z`));
});

afterAll(() => {
  vi.useRealTimers();
});

const { z } = await import('zod');

function buildSchema() {
  const today = () => new Date().toISOString().split('T')[0] ?? '';

  return z
    .object({
      origin: z.string().length(3, 'Select a valid origin airport').toUpperCase(),
      destination: z.string().length(3, 'Select a valid destination airport').toUpperCase(),
      tripType: z.enum(['one-way', 'round-trip']),
      departureDate: z.string().min(1, 'Select a departure date'),
      returnDate: z.string().optional(),
      adults: z.number().int().min(1, 'At least 1 adult required'),
      children: z.number().int().min(0),
      seatClass: z.enum(['ECONOMY', 'BUSINESS']),
    })
    .refine((d) => d.origin !== d.destination, {
      message: 'Origin and destination must be different',
      path: ['destination'],
    })
    .refine((d) => d.departureDate >= today(), {
      message: 'Departure date must be today or in the future',
      path: ['departureDate'],
    })
    .refine((d) => d.tripType === 'one-way' || (!!d.returnDate && d.returnDate > d.departureDate), {
      message: 'Return date must be after departure date',
      path: ['returnDate'],
    });
}

const schema = buildSchema();

const validBase = {
  origin: 'LHR',
  destination: 'ARN',
  tripType: 'one-way' as const,
  departureDate: '2026-06-28',
  adults: 1,
  children: 0,
  seatClass: 'ECONOMY' as const,
};

describe('SearchForm validation schema', () => {
  it('accepts a valid one-way search', () => {
    expect(schema.safeParse(validBase).success).toBe(true);
  });

  it('accepts a valid round-trip with return after departure', () => {
    const result = schema.safeParse({
      ...validBase,
      tripType: 'round-trip',
      returnDate: '2026-07-05',
    });
    expect(result.success).toBe(true);
  });

  it('rejects when origin equals destination', () => {
    const result = schema.safeParse({ ...validBase, destination: 'LHR' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('destination');
    }
  });

  it('rejects a departure date in the past', () => {
    const result = schema.safeParse({ ...validBase, departureDate: '2026-06-26' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('departureDate');
    }
  });

  it('rejects round-trip return date before departure date', () => {
    const result = schema.safeParse({
      ...validBase,
      tripType: 'round-trip',
      returnDate: '2026-06-27',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('returnDate');
    }
  });

  it('accepts one-way without return date', () => {
    const result = schema.safeParse({ ...validBase, tripType: 'one-way' });
    expect(result.success).toBe(true);
  });

  it('rejects an IATA code shorter than 3 characters', () => {
    const result = schema.safeParse({ ...validBase, origin: 'LH' });
    expect(result.success).toBe(false);
  });

  it('rejects adults count of 0', () => {
    const result = schema.safeParse({ ...validBase, adults: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('adults');
    }
  });

  it('accepts children count of 0', () => {
    const result = schema.safeParse({ ...validBase, children: 0 });
    expect(result.success).toBe(true);
  });

  it('accepts children count greater than 0', () => {
    const result = schema.safeParse({ ...validBase, adults: 2, children: 3 });
    expect(result.success).toBe(true);
  });
});
