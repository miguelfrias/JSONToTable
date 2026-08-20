import { describe, it, expect } from 'vitest';
import { calculateValueSizeBytes, formatByteSize } from '../utils/adminStorageHelper';
import { isViewsAdminRoute } from '../utils/routerHelper';

describe('adminStorageHelper & routerHelper', () => {
  it('calculates value size accurately', () => {
    expect(calculateValueSizeBytes('hello')).toBe(5);
    expect(calculateValueSizeBytes({ a: 1 })).toBeGreaterThan(0);
    expect(calculateValueSizeBytes(null)).toBe(0);
  });

  it('formats byte sizes cleanly', () => {
    expect(formatByteSize(500)).toBe('500 B');
    expect(formatByteSize(1024 * 50)).toBe('50.0 KB');
    expect(formatByteSize(1024 * 1024 * 2.5)).toBe('2.50 MB');
  });

  it('detects /#/views admin route correctly', () => {
    window.location.hash = '#/views';
    expect(isViewsAdminRoute()).toBe(true);

    window.location.hash = '#/v/12345678-1234';
    expect(isViewsAdminRoute()).toBe(false);
  });
});
