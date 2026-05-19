import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatDateShort } from './formatDate';

describe('formatDate', () => {
  it('formats ISO string to readable date', () => {
    expect(formatDate('2026-05-20T10:00:00Z')).toBe('20 May 2026');
  });

  it('returns day month year format', () => {
    expect(formatDate('2026-01-01T00:00:00Z')).toBe('1 Jan 2026');
  });
});

describe('formatTime', () => {
  it('formats ISO string to HH:MM', () => {
    const result = formatTime('2026-05-20T10:30:00Z');
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('formatDateShort', () => {
  it('formats ISO string to DD/MM/YYYY', () => {
    expect(formatDateShort('2026-05-20T10:00:00Z')).toBe('20/05/2026');
  });
});
