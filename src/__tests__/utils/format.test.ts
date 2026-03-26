import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatLastUpdated,
  getGainLossColorClass,
  formatGainLoss,
} from '../../utils/format';

describe('formatCurrency', () => {
  it('formats a positive value as USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats a negative value', () => {
    expect(formatCurrency(-500.1)).toBe('-$500.10');
  });

  it('respects a different currency code', () => {
    const result = formatCurrency(100, 'EUR');
    expect(result).toContain('100');
  });

  it('applies custom Intl options', () => {
    const result = formatCurrency(1000, 'USD', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    expect(result).toBe('$1,000');
  });
});

describe('formatNumber', () => {
  it('formats with default 2 decimal places', () => {
    expect(formatNumber(1234.5)).toBe('1,234.50');
  });

  it('formats with 0 decimal places', () => {
    expect(formatNumber(1234.5, 0)).toBe('1,235');
  });

  it('formats with 4 decimal places', () => {
    expect(formatNumber(1.23456, 4)).toBe('1.2346');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0.00');
  });

  it('formats negative numbers', () => {
    expect(formatNumber(-99.9)).toBe('-99.90');
  });
});

describe('formatPercentage', () => {
  it('appends % to formatted number', () => {
    expect(formatPercentage(12.5)).toBe('12.50%');
  });

  it('uses custom decimal places', () => {
    expect(formatPercentage(12.5678, 1)).toBe('12.6%');
  });

  it('formats zero', () => {
    expect(formatPercentage(0)).toBe('0.00%');
  });

  it('formats negative percentage', () => {
    expect(formatPercentage(-3.14)).toBe('-3.14%');
  });
});

describe('formatLastUpdated', () => {
  it('formats a Date object', () => {
    const date = new Date('2024-06-15T14:30:00Z');
    const result = formatLastUpdated(date);
    expect(result).toContain('2024');
    expect(result).toContain('15');
  });

  it('formats a valid date string', () => {
    const result = formatLastUpdated('2024-01-01T00:00:00Z');
    expect(result).toContain('2024');
    expect(result).toContain('January');
  });

  it('falls back to current date for invalid string', () => {
    const result = formatLastUpdated('not-a-date');
    const currentYear = new Date().getFullYear().toString();
    expect(result).toContain(currentYear);
  });
});

describe('getGainLossColorClass', () => {
  it('returns green for positive values', () => {
    expect(getGainLossColorClass(100)).toBe('text-green-600');
  });

  it('returns red for negative values', () => {
    expect(getGainLossColorClass(-50)).toBe('text-red-600');
  });

  it('returns gray for zero', () => {
    expect(getGainLossColorClass(0)).toBe('text-gray-600');
  });
});

describe('formatGainLoss', () => {
  it('formats positive gain with + sign', () => {
    const result = formatGainLoss(500, 10.5);
    expect(result.formatted).toContain('+');
    expect(result.formatted).toContain('$500.00');
    expect(result.formatted).toContain('10.50%');
    expect(result.colorClass).toBe('text-green-600');
  });

  it('formats negative loss', () => {
    const result = formatGainLoss(-200, -5.25);
    expect(result.formatted).toContain('-$200.00');
    expect(result.formatted).toContain('-5.25%');
    expect(result.colorClass).toBe('text-red-600');
  });

  it('formats zero gain/loss', () => {
    const result = formatGainLoss(0, 0);
    expect(result.formatted).toContain('$0.00');
    expect(result.formatted).toContain('0.00%');
    expect(result.colorClass).toBe('text-gray-600');
  });
});
