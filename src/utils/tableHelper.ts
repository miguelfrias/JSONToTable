import type { TableRowData, ColumnMeta } from '../types/table';

/**
 * Extracts all unique keys from an array of row objects (scanning all rows)
 */
export function extractUniqueColumnKeys(rows: TableRowData[]): { key: string; meta: ColumnMeta }[] {
  if (!rows || rows.length === 0) return [];

  const keyMap = new Map<string, ColumnMeta>();

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;

    for (const [key, value] of Object.entries(row)) {
      if (!keyMap.has(key)) {
        let type: ColumnMeta['type'] = 'string';
        if (value === null || value === undefined) {
          type = 'null';
        } else if (Array.isArray(value)) {
          type = 'array';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'object') {
          type = 'object';
        }

        keyMap.set(key, {
          type,
          isNested: type === 'object' || type === 'array',
        });
      } else {
        // Upgrade 'null' type if a later row has concrete type
        const existing = keyMap.get(key)!;
        if (existing.type === 'null' && value !== null && value !== undefined) {
          let updatedType: ColumnMeta['type'] = 'string';
          if (Array.isArray(value)) updatedType = 'array';
          else if (typeof value === 'boolean') updatedType = 'boolean';
          else if (typeof value === 'number') updatedType = 'number';
          else if (typeof value === 'object') updatedType = 'object';
          keyMap.set(key, { ...existing, type: updatedType, isNested: updatedType === 'object' || updatedType === 'array' });
        }
      }
    }
  }

  // Prioritize id, title, name to the beginning if present
  const keys = Array.from(keyMap.entries()).map(([key, meta]) => ({ key, meta }));
  return keys.sort((a, b) => {
    const priority = (name: string) => {
      const lower = name.toLowerCase();
      if (lower === 'id' || lower === '_id') return 0;
      if (lower === 'title' || lower === 'name' || lower === 'username') return 1;
      return 2;
    };
    return priority(a.key) - priority(b.key);
  });
}

/**
 * Pretty-prints or formats a cell value
 */
export function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '[Complex Object]';
    }
  }
  return String(value);
}

/**
 * Exports data to CSV string
 */
export function convertToCSV(rows: TableRowData[], visibleColumnKeys?: string[]): string {
  if (!rows || rows.length === 0) return '';

  const columns = visibleColumnKeys && visibleColumnKeys.length > 0
    ? visibleColumnKeys
    : extractUniqueColumnKeys(rows).map((c) => c.key);

  const headerRow = columns.map((col) => `"${col.replace(/"/g, '""')}"`).join(',');

  const bodyRows = rows.map((row) => {
    return columns
      .map((col) => {
        const val = row[col];
        const formatted = formatCellValue(val);
        return `"${formatted.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [headerRow, ...bodyRows].join('\r\n');
}

/**
 * Triggers browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
