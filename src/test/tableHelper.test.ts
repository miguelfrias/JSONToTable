import { describe, it, expect } from 'vitest';
import { extractUniqueColumnKeys, formatCellValue, convertToCSV } from '../utils/tableHelper';

describe('tableHelper', () => {
  it('extracts unique column keys from all rows even with sparse data', () => {
    const rows = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob', age: 30 },
      { id: 3, email: 'carol@test.com' },
    ];
    const columns = extractUniqueColumnKeys(rows);
    const keys = columns.map((c) => c.key);
    expect(keys).toContain('id');
    expect(keys).toContain('name');
    expect(keys).toContain('age');
    expect(keys).toContain('email');
  });

  it('formats cell values properly', () => {
    expect(formatCellValue(null)).toBe('');
    expect(formatCellValue(undefined)).toBe('');
    expect(formatCellValue(true)).toBe('true');
    expect(formatCellValue(123)).toBe('123');
    expect(formatCellValue({ a: 1 })).toBe('{"a":1}');
  });

  it('converts row data to CSV format', () => {
    const rows = [
      { id: 1, name: 'Alice', role: 'Engineer' },
      { id: 2, name: 'Bob', role: 'Designer' },
    ];
    const csv = convertToCSV(rows, ['id', 'name', 'role']);
    expect(csv).toContain('"id","name","role"');
    expect(csv).toContain('"1","Alice","Engineer"');
    expect(csv).toContain('"2","Bob","Designer"');
  });
});
