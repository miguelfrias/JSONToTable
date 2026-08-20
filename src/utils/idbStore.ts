import { createStore, type UseStore } from 'idb-keyval';

/**
 * Dedicated, isolated IndexedDB database and store for JSONToTable.
 * This guarantees zero collisions with any other repositories hosted under the same GitHub Pages origin.
 */
export const JSON_TO_TABLE_DB_NAME = 'json_to_table_db';
export const JSON_TO_TABLE_STORE_NAME = 'json_to_table_store';

export const customIdbStore: UseStore = createStore(
  JSON_TO_TABLE_DB_NAME,
  JSON_TO_TABLE_STORE_NAME
);
