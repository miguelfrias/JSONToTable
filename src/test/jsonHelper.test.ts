import { describe, it, expect } from 'vitest';
import { parseJsonSafe, normalizeToTableRows, formatJsonString } from '../utils/jsonHelper';

describe('jsonHelper', () => {
  it('parses valid JSON successfully', () => {
    const raw = JSON.stringify([{ id: 1, name: 'Alice' }]);
    const { data, error } = parseJsonSafe(raw);
    expect(error).toBeNull();
    expect(data).toEqual([{ id: 1, name: 'Alice' }]);
  });

  it('handles empty input with a validation error', () => {
    const { data, error } = parseJsonSafe('');
    expect(data).toBeNull();
    expect(error?.type).toBe('validation');
  });

  it('catches syntax errors and provides line/column info', () => {
    const invalidJson = '{\n  "name": "Alice",\n  "age": \n}';
    const { data, error } = parseJsonSafe(invalidJson);
    expect(data).toBeNull();
    expect(error?.type).toBe('syntax');
    expect(error?.line).toBeDefined();
  });

  it('normalizes array of objects into rows', () => {
    const input = [
      { id: 1, title: 'Item 1' },
      { id: 2, title: 'Item 2' },
    ];
    const { rows } = normalizeToTableRows(input);
    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe(1);
  });

  it('normalizes primitive array into rows', () => {
    const input = ['Apple', 'Banana', 'Cherry'];
    const { rows } = normalizeToTableRows(input);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({ index: 1, value: 'Apple' });
  });

  it('normalizes single object into 1-row table', () => {
    const input = { id: 42, title: 'Single Record' };
    const { rows } = normalizeToTableRows(input);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(42);
  });

  it('formats JSON nicely', () => {
    const raw = '{"a":1,"b":2}';
    const { formatted, error } = formatJsonString(raw);
    expect(error).toBeNull();
    expect(formatted).toContain('\n');
  });
});
