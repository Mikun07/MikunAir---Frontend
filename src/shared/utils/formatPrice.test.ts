import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formats zero pence as £0.00', () => {
    expect(formatPrice(0)).toBe('£0.00');
  });

  it('formats 1 pence as £0.01', () => {
    expect(formatPrice(1)).toBe('£0.01');
  });

  it('formats 100 pence as £1.00', () => {
    expect(formatPrice(100)).toBe('£1.00');
  });

  it('formats 12550 pence as £125.50', () => {
    expect(formatPrice(12550)).toBe('£125.50');
  });

  it('formats 99999 pence as £999.99', () => {
    expect(formatPrice(99999)).toBe('£999.99');
  });

  it('always produces two decimal places', () => {
    expect(formatPrice(1000)).toBe('£10.00');
  });
});
