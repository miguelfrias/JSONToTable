import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSchemaKey,
  saveAppStateToLocalStorage,
  loadAppStateFromLocalStorage,
  saveSchemaConfigToLocalStorage,
  loadSchemaConfigFromLocalStorage,
} from '../utils/storageHelper';

describe('storageHelper', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates deterministic schema keys from column key arrays', () => {
    const key1 = generateSchemaKey(['id', 'title', 'price']);
    const key2 = generateSchemaKey(['price', 'id', 'title']);
    expect(key1).toBe(key2);
    expect(key1).toContain('json_table_schema_');
  });

  it('saves and loads app state from localStorage', () => {
    const state = {
      sourceType: 'url' as const,
      url: 'https://example.com/api',
      jsonPath: '$.items',
      isSidebarCollapsed: false,
      globalFilter: 'phone',
      lastUpdated: 123456789,
    };
    saveAppStateToLocalStorage(state);
    const loaded = loadAppStateFromLocalStorage();
    expect(loaded).toEqual(state);
  });

  it('saves and loads schema view configuration from localStorage', () => {
    const schemaKey = 'json_table_schema_test';
    const config = {
      columnVisibility: { sku: false },
      columnOrder: ['id', 'title', 'price'],
      columnSizing: { title: 250 },
    };
    saveSchemaConfigToLocalStorage(schemaKey, config);
    const loaded = loadSchemaConfigFromLocalStorage(schemaKey);
    expect(loaded).toEqual(config);
  });
});
