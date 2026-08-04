import { jest } from '@jest/globals';
import { withTimeout } from '../utils.js';

describe('withTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve with the value if promise resolves before timeout', async () => {
    const promise = Promise.resolve('success');
    const result = await withTimeout(promise, 1000, 'Test');
    expect(result).toBe('success');
  });

  it('should reject with the original error if promise rejects before timeout', async () => {
    const error = new Error('original error');
    const promise = Promise.reject(error);

    await expect(withTimeout(promise, 1000, 'Test')).rejects.toThrow('original error');
  });

  it('should reject with a timeout error if promise takes too long', async () => {
    // Create a promise that never resolves
    const pendingPromise = new Promise(() => {});

    // We don't await the withTimeout directly because it will block.
    // Instead we start it, then advance timers, then await it to check rejection.
    const timeoutPromise = withTimeout(pendingPromise, 1000, 'Network');

    // Advance timers by the timeout amount
    jest.advanceTimersByTime(1000);

    await expect(timeoutPromise).rejects.toThrow('Network - Timeout (network/rules problem)');
  });
  it('should resolve immediately if a non-promise value is passed', async () => {
    const result = await withTimeout('primitive', 1000, 'Test');
    expect(result).toBe('primitive');
  });
});
