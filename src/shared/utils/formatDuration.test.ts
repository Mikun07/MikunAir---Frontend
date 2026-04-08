import { describe, it, expect } from 'vitest';
import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  it('formats minutes-only durations', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });

  it('formats exactly 1 hour', () => {
    expect(formatDuration(60)).toBe('1h 0m');
  });

  it('formats zero minutes', () => {
    expect(formatDuration(0)).toBe('0m');
  });
});
