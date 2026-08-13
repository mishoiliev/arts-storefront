import { describe, expect, test } from 'bun:test';

import { formatPercentage } from '@/lib/format';

describe('percentage formatting', () => {
  test('preserves meaningful API precision without trailing zeroes', () => {
    expect(formatPercentage(7.17)).toBe('7.17');
    expect(formatPercentage(12.5)).toBe('12.5');
    expect(formatPercentage(10)).toBe('10');
  });
});
