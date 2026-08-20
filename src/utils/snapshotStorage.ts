import { get, set, del } from 'idb-keyval';
import type { TableSnapshot, SnapshotMetadata } from '../types/table';
import { customIdbStore } from './idbStore';

const SNAPSHOT_INDEX_KEY = 'json_table_snapshots_index_v1';
const SNAPSHOT_DATA_PREFIX = 'json_table_snapshot_';

/**
 * Lists all snapshot metadata without loading full raw JSON payloads
 */
export async function listAllSnapshotsFromDB(): Promise<SnapshotMetadata[]> {
  try {
    const list = await get<SnapshotMetadata[]>(SNAPSHOT_INDEX_KEY, customIdbStore);
    return list || [];
  } catch (err) {
    console.warn('Failed to list snapshots from IndexedDB:', err);
    return [];
  }
}

/**
 * Saves or updates a snapshot in isolated IndexedDB
 */
export async function saveSnapshotToDB(snapshot: TableSnapshot): Promise<void> {
  try {
    // 1. Save full snapshot payload
    await set(`${SNAPSHOT_DATA_PREFIX}${snapshot.id}`, snapshot, customIdbStore);

    // 2. Update index list (metadata only)
    const existingList = await listAllSnapshotsFromDB();
    const metadata: SnapshotMetadata = {
      id: snapshot.id,
      title: snapshot.title,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      sourceType: snapshot.sourceType,
      url: snapshot.url,
      jsonPath: snapshot.jsonPath,
      globalFilter: snapshot.globalFilter,
      columnOrder: snapshot.columnOrder,
      columnVisibility: snapshot.columnVisibility,
      columnSizing: snapshot.columnSizing,
      sorting: snapshot.sorting,
      columnFilters: snapshot.columnFilters,
      rowCount: snapshot.rowCount,
      columnCount: snapshot.columnCount,
    };

    const index = existingList.findIndex((item) => item.id === snapshot.id);
    let updatedList: SnapshotMetadata[];
    if (index >= 0) {
      updatedList = [...existingList];
      updatedList[index] = metadata;
    } else {
      updatedList = [metadata, ...existingList];
    }

    await set(SNAPSHOT_INDEX_KEY, updatedList, customIdbStore);
  } catch (err) {
    console.warn('Failed to save snapshot to IndexedDB:', err);
    throw err;
  }
}

/**
 * Loads a full snapshot (including raw JSON data payload) by its UUID
 */
export async function loadSnapshotFromDB(id: string): Promise<TableSnapshot | null> {
  try {
    const data = await get<TableSnapshot>(`${SNAPSHOT_DATA_PREFIX}${id}`, customIdbStore);
    return data || null;
  } catch (err) {
    console.warn(`Failed to load snapshot ${id} from IndexedDB:`, err);
    return null;
  }
}

/**
 * Deletes a snapshot from isolated IndexedDB
 */
export async function deleteSnapshotFromDB(id: string): Promise<void> {
  try {
    await del(`${SNAPSHOT_DATA_PREFIX}${id}`, customIdbStore);
    const existingList = await listAllSnapshotsFromDB();
    const updatedList = existingList.filter((item) => item.id !== id);
    await set(SNAPSHOT_INDEX_KEY, updatedList, customIdbStore);
  } catch (err) {
    console.warn(`Failed to delete snapshot ${id} from IndexedDB:`, err);
    throw err;
  }
}
