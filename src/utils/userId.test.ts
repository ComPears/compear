import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getUserId } from './userId';

describe('receipt user ID randomness', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('uses randomUUID when available', () => {
    const randomUUID = vi.fn(() => '12345678-1234-4234-8234-123456789abc');
    vi.stubGlobal('crypto', { randomUUID });
    expect(getUserId()).toBe('12345678123442348234123456789abc');
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it('uses 128 random bits when randomUUID is unavailable', () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.set(Array.from({ length: 16 }, (_, i) => i));
      return bytes;
    });
    vi.stubGlobal('crypto', { randomUUID: undefined, getRandomValues });
    expect(getUserId()).toBe('000102030405060708090a0b0c0d0e0f');
    expect(getRandomValues).toHaveBeenCalledOnce();
    expect(getRandomValues.mock.calls[0][0]).toHaveLength(16);
  });

  it('fails closed without a cryptographic random source', () => {
    vi.stubGlobal('crypto', undefined);
    expect(() => getUserId()).toThrow(/Secure random/);
    expect(localStorage.getItem('compear-user-id')).toBeNull();
  });

  it('preserves an existing valid ID without generating another', () => {
    localStorage.setItem('compear-user-id', 'existing-user-id');
    vi.stubGlobal('crypto', undefined);
    expect(getUserId()).toBe('existing-user-id');
  });
});
