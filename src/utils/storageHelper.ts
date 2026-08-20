import { get, set, del } from 'idb-keyval';
import type { VisibilityState, ColumnSizingState, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import type { InputSourceType } from '../types/table';

const IDB_DATA_KEY = 'json_table_data_payload';
const LOCAL_APP_STATE_KEY = 'json_table_app_state_v1';
const LOCAL_SCHEMA_PREFIX = 'json_table_schema_';

export interface PersistedAppState {
  sourceType: InputSourceType;
  url: string;
  jsonPath: string;
  isSidebarCollapsed: boolean;
  globalFilter: string;
  lastUpdated: number;
}

export interface SchemaViewConfig {
  columnVisibility?: VisibilityState;
  columnOrder?: string[];
  columnSizing?: ColumnSizingState;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
}

/**
 * Computes a quick signature from column keys
 */
export function generateSchemaKey(columnKeys: string[]): string {
  if (!columnKeys || columnKeys.length === 0) return 'default';
  const sorted = [...columnKeys].sort().join(',');
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    const char = sorted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `${LOCAL_SCHEMA_PREFIX}${Math.abs(hash)}`;
}

/**
 * Save raw JSON string to IndexedDB (asynchronous, handles 641KB - 50MB+)
 */
export async function saveRawDataToIndexedDB(rawJson: string): Promise<void> {
  try {
    await set(IDB_DATA_KEY, rawJson);
  } catch (err) {
    console.warn('Failed to save data in IndexedDB:', err);
  }
}

/**
 * Load raw JSON string from IndexedDB
 */
export async function loadRawDataFromIndexedDB(): Promise<string | null> {
  try {
    const data = await get<string>(IDB_DATA_KEY);
    return data || null;
  } catch (err) {
    console.warn('Failed to load data from IndexedDB:', err);
    return null;
  }
}

/**
 * Save general app state to localStorage
 */
export function saveAppStateToLocalStorage(state: PersistedAppState): void {
  try {
    localStorage.setItem(LOCAL_APP_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save app state in localStorage:', err);
  }
}

/**
 * Load general app state from localStorage
 */
export function loadAppStateFromLocalStorage(): PersistedAppState | null {
  try {
    const item = localStorage.getItem(LOCAL_APP_STATE_KEY);
    if (!item) return null;
    return JSON.parse(item);
  } catch (err) {
    console.warn('Failed to load app state from localStorage:', err);
    return null;
  }
}

/**
 * Save schema-specific column view configuration to localStorage
 */
export function saveSchemaConfigToLocalStorage(schemaKey: string, config: SchemaViewConfig): void {
  try {
    localStorage.setItem(schemaKey, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save schema config in localStorage:', err);
  }
}

/**
 * Load schema-specific column view configuration from localStorage
 */
export function loadSchemaConfigFromLocalStorage(schemaKey: string): SchemaViewConfig | null {
  try {
    const item = localStorage.getItem(schemaKey);
    if (!item) return null;
    return JSON.parse(item);
  } catch (err) {
    console.warn('Failed to load schema config from localStorage:', err);
    return null;
  }
}

/**
 * Clears all persisted storage (both IndexedDB and localStorage)
 */
export async function clearAllPersistedStorage(): Promise<void> {
  try {
    await del(IDB_DATA_KEY);
    localStorage.removeItem(LOCAL_APP_STATE_KEY);
  } catch (err) {
    console.warn('Failed to clear storage:', err);
  }
}
