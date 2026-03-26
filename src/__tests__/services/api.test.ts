import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchPortfolio, fetchTransactions, ApiError } from '../../services/api';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ApiError', () => {
  it('creates an error with message, status, and statusText', () => {
    const err = new ApiError('Not found', 404, 'Not Found');
    expect(err.message).toBe('Not found');
    expect(err.status).toBe(404);
    expect(err.statusText).toBe('Not Found');
    expect(err.name).toBe('ApiError');
    expect(err).toBeInstanceOf(Error);
  });

  it('creates an error with message only', () => {
    const err = new ApiError('Something broke');
    expect(err.message).toBe('Something broke');
    expect(err.status).toBeUndefined();
    expect(err.statusText).toBeUndefined();
  });
});

describe('fetchPortfolio', () => {
  it('returns data on successful response', async () => {
    const mockData = {
      accountNumber: '1234567890',
      totalValue: 50000,
      totalGainLoss: 1500,
      totalGainLossPercent: 3.1,
      holdings: [],
      lastUpdated: '2024-01-01',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchPortfolio('1234567890');
    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/portfolio/1234567890');
  });

  it('throws ApiError with detail on 400 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ detail: 'Invalid account number format' }),
    });

    try {
      await fetchPortfolio('bad');
      expect.fail('Expected ApiError to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('Invalid account number format');
      expect((error as ApiError).status).toBe(400);
    }
  });

  it('throws ApiError on other HTTP errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    });

    await expect(fetchPortfolio('1234567890')).rejects.toThrow('HTTP 500: Internal Server Error');
  });

  it('throws connection error when fetch fails with TypeError', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(fetchPortfolio('1234567890')).rejects.toThrow(
      'Unable to connect to the server'
    );
  });

  it('throws generic error for unknown failures', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Some unknown error'));

    await expect(fetchPortfolio('1234567890')).rejects.toThrow(
      'An unexpected error occurred while fetching portfolio data.'
    );
  });
});

describe('fetchTransactions', () => {
  it('returns data on successful response', async () => {
    const mockData = {
      accountNumber: '1234567890',
      transactions: [{ id: 1, type: 'BUY' }],
      message: 'Success',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchTransactions('1234567890');
    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/transactions/1234567890');
  });

  it('throws ApiError with detail on 400 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ detail: 'Account not found' }),
    });

    await expect(fetchTransactions('bad')).rejects.toThrow('Account not found');
  });

  it('throws ApiError on other HTTP errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: () => Promise.resolve({}),
    });

    await expect(fetchTransactions('1234567890')).rejects.toThrow('HTTP 503: Service Unavailable');
  });

  it('throws connection error when fetch fails with TypeError', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(fetchTransactions('1234567890')).rejects.toThrow(
      'Unable to connect to the server'
    );
  });

  it('throws generic error for unknown failures', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Something'));

    await expect(fetchTransactions('1234567890')).rejects.toThrow(
      'An unexpected error occurred while fetching transaction data.'
    );
  });
});
