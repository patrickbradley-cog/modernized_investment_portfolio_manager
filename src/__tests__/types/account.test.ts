import { describe, it, expect } from 'vitest';
import { accountNumberSchema, accountFormSchema } from '../../types/account';

describe('accountNumberSchema', () => {
  it('accepts a valid 10-digit account number', () => {
    const result = accountNumberSchema.safeParse('1234567890');
    expect(result.success).toBe(true);
  });

  it('rejects a string shorter than 10 digits', () => {
    const result = accountNumberSchema.safeParse('123456789');
    expect(result.success).toBe(false);
  });

  it('rejects a string longer than 10 digits', () => {
    const result = accountNumberSchema.safeParse('12345678901');
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric characters', () => {
    const result = accountNumberSchema.safeParse('12345abcde');
    expect(result.success).toBe(false);
  });

  it('rejects an empty string', () => {
    const result = accountNumberSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejects strings with spaces', () => {
    const result = accountNumberSchema.safeParse('12345 6789');
    expect(result.success).toBe(false);
  });

  it('rejects strings with special characters', () => {
    const result = accountNumberSchema.safeParse('1234-56789');
    expect(result.success).toBe(false);
  });
});

describe('accountFormSchema', () => {
  it('validates a correct form object', () => {
    const result = accountFormSchema.safeParse({ accountNumber: '1234567890' });
    expect(result.success).toBe(true);
  });

  it('rejects an object with invalid account number', () => {
    const result = accountFormSchema.safeParse({ accountNumber: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rejects an object missing accountNumber', () => {
    const result = accountFormSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
