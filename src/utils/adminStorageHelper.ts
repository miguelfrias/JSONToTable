import { entries, del, clear, get, set } from 'idb-keyval';
import type { TableSnapshot } from '../types/table';
import { listAllSnapshotsFromDB, saveSnapshotToDB } from './snapshotStorage';

export interface StorageItemDetail {
  key: string;
  category: 'snapshot' | 'index' | 'legacy_data' | 'other';
  label: string;
  sizeBytes: number;
  formattedSize: string;
  itemCount?: number;
  previewSnippet: string;
  value: any;
}

/**
 * Calculates byte size of a value
 */
export function calculateValueSizeBytes(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'string') return new Blob([val]).size;
  try {
    return new Blob([JSON.stringify(val)]).size;
  } catch {
    return 0;
  }
}

/**
 * Formats bytes to human-readable string
 */
export function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Retrieves all raw entries from IndexedDB with metadata and categorization
 */
export async function getAllIndexedDbEntries(): Promise<StorageItemDetail[]> {
  try {
    const rawEntries = await entries();
    return rawEntries.map(([key, value]) => {
      const keyStr = String(key);
      const sizeBytes = calculateValueSizeBytes(value);
      const formattedSize = formatByteSize(sizeBytes);

      let category: StorageItemDetail['category'] = 'other';
      let label = keyStr;
      let itemCount: number | undefined;

      if (keyStr.startsWith('json_table_snapshot_')) {
        category = 'snapshot';
        const snapshot = value as TableSnapshot;
        label = snapshot?.title ? `Snapshot: ${snapshot.title}` : keyStr;
        itemCount = snapshot?.rowCount;
      } else if (keyStr === 'json_table_snapshots_index_v1') {
        category = 'index';
        label = 'Snapshots Index Directory';
        itemCount = Array.isArray(value) ? value.length : undefined;
      } else if (keyStr === 'json_table_data_payload') {
        category = 'legacy_data';
        label = 'Legacy Data Payload (Pre-refactor)';
      }

      let previewSnippet = '';
      if (typeof value === 'string') {
        previewSnippet = value.slice(0, 200);
      } else {
        try {
          previewSnippet = JSON.stringify(value).slice(0, 200);
        } catch {
          previewSnippet = '[Complex Object]';
        }
      }

      return {
        key: keyStr,
        category,
        label,
        sizeBytes,
        formattedSize,
        itemCount,
        previewSnippet,
        value,
      };
    });
  } catch (err) {
    console.error('Failed to get all IndexedDB entries:', err);
    return [];
  }
}

/**
 * Deletes any individual key from IndexedDB
 */
export async function deleteIndexedDbKey(key: string): Promise<void> {
  try {
    await del(key);

    // If it was a snapshot, also remove from index
    if (key.startsWith('json_table_snapshot_')) {
      const snapshotId = key.replace('json_table_snapshot_', '');
      const existingList = await listAllSnapshotsFromDB();
      const updated = existingList.filter((s) => s.id !== snapshotId);
      await set('json_table_snapshots_index_v1', updated);
    }
  } catch (err) {
    console.error(`Failed to delete key ${key}:`, err);
    throw err;
  }
}

/**
 * Converts a legacy data payload entry into a proper named snapshot with a UUID
 */
export async function convertLegacyPayloadToSnapshot(legacyKey = 'json_table_data_payload'): Promise<string> {
  const rawData = await get<string>(legacyKey);
  if (!rawData) {
    throw new Error('No legacy data payload found.');
  }

  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const now = Date.now();
  let rowCount = 0;
  try {
    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed)) rowCount = parsed.length;
    else if (typeof parsed === 'object') rowCount = 1;
  } catch {
    // Non-JSON or raw
  }

  const snapshot: TableSnapshot = {
    id,
    title: `Recovered Legacy Data (${new Date(now).toLocaleDateString()})`,
    createdAt: now,
    updatedAt: now,
    sourceType: 'raw',
    rawJson: rawData,
    jsonPath: '$',
    rowCount,
  };

  await saveSnapshotToDB(snapshot);
  // Remove legacy key after successful conversion
  await del(legacyKey);

  return id;
}

/**
 * Completely wipes all IndexedDB entries and localStorage for this application
 */
export async function clearAllAppStorage(): Promise<void> {
  try {
    await clear();
    localStorage.clear();
  } catch (err) {
    console.error('Failed to clear entire storage:', err);
    throw err;
  }
}
