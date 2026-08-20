import { describe, it, expect } from 'vitest';
import { evaluateJsonPath, discoverArrayPaths } from '../utils/jsonPathHelper';

describe('jsonPathHelper', () => {
  const sampleJson = {
    store: {
      name: 'SuperStore',
      products: [
        { id: 1, name: 'Laptop', price: 999 },
        { id: 2, name: 'Phone', price: 699 },
      ],
      location: {
        city: 'San Francisco',
        departments: ['Electronics', 'Home'],
      },
    },
  };

  it('evaluates root query $ correctly', () => {
    const res = evaluateJsonPath([1, 2, 3], '$');
    expect(res.isValid).toBe(true);
    expect(res.data).toEqual([1, 2, 3]);
  });

  it('evaluates $.store.products path query correctly', () => {
    const res = evaluateJsonPath(sampleJson, '$.store.products');
    expect(res.isValid).toBe(true);
    expect(res.data).toHaveLength(2);
    expect(res.data?.[0].name).toBe('Laptop');
  });

  it('auto-normalizes "store.products" without leading $', () => {
    const res = evaluateJsonPath(sampleJson, 'store.products');
    expect(res.isValid).toBe(true);
    expect(res.data).toHaveLength(2);
  });

  it('returns invalid state for non-existent path', () => {
    const res = evaluateJsonPath(sampleJson, '$.store.nonexistent');
    expect(res.isValid).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('discovers array paths automatically', () => {
    const paths = discoverArrayPaths(sampleJson);
    expect(paths).toContain('$.store.products');
    expect(paths).toContain('$.store.location.departments');
  });
});
