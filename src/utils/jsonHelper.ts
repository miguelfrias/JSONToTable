import type { ParseError, TableRowData } from '../types/table';

/**
 * Extracts line and column from a JSON parsing error message or string position
 */
export function extractJsonErrorDetails(jsonString: string, error: Error): ParseError {
  let line = 1;
  let column = 1;
  const message = error.message;

  // Many browsers output "at position X" in JSON.parse error
  const positionMatch = error.message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const pos = parseInt(positionMatch[1], 10);
    if (!isNaN(pos) && pos >= 0 && pos <= jsonString.length) {
      const upToError = jsonString.slice(0, pos);
      const lines = upToError.split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }
  } else {
    // Some engines output "line X column Y"
    const lineColMatch = error.message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    }
  }

  // Generate snippet preview around error line
  let snippet: string | undefined;
  if (jsonString) {
    const lines = jsonString.split('\n');
    const targetLineIdx = line - 1;
    if (targetLineIdx >= 0 && targetLineIdx < lines.length) {
      const errorLine = lines[targetLineIdx];
      const pointer = ' '.repeat(Math.max(0, column - 1)) + '^';
      snippet = `${errorLine}\n${pointer}`;
    }
  }

  return {
    message,
    line,
    column,
    type: 'syntax',
    details: snippet,
  };
}

/**
 * Safe JSON parser returning parsed data or ParseError
 */
export function parseJsonSafe(raw: string): { data: any | null; error: ParseError | null } {
  if (!raw || !raw.trim()) {
    return {
      data: null,
      error: {
        message: 'JSON input is empty. Please enter or paste valid JSON.',
        type: 'validation',
      },
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return { data: parsed, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: extractJsonErrorDetails(raw, err instanceof Error ? err : new Error(String(err))),
    };
  }
}

/**
 * Formats raw parsed data into a standard array of table rows
 */
export function normalizeToTableRows(input: any): { rows: TableRowData[]; warning?: string } {
  if (input === null || input === undefined) {
    return { rows: [] };
  }

  // Already array of objects
  if (Array.isArray(input)) {
    if (input.length === 0) {
      return { rows: [] };
    }

    // Check if elements are primitives or objects
    const hasNonObject = input.some((item) => item === null || typeof item !== 'object');
    if (hasNonObject) {
      // Convert primitive array to rows
      return {
        rows: input.map((item, index) => {
          if (item !== null && typeof item === 'object') {
            return { index: index + 1, ...item };
          }
          return { index: index + 1, value: item };
        }),
      };
    }

    return { rows: input as TableRowData[] };
  }

  // If input is a single object, wrap it as a 1-row table or check if it has a natural items array
  if (typeof input === 'object') {
    return { rows: [input as TableRowData] };
  }

  // Primitive value
  return { rows: [{ value: input }] };
}

/**
 * Helper to pretty-format JSON string
 */
export function formatJsonString(raw: string): { formatted: string; error: string | null } {
  try {
    const obj = JSON.parse(raw);
    return { formatted: JSON.stringify(obj, null, 2), error: null };
  } catch (e: any) {
    return { formatted: raw, error: e.message || 'Invalid JSON syntax' };
  }
}

/**
 * Helper to minify JSON string
 */
export function minifyJsonString(raw: string): { minified: string; error: string | null } {
  try {
    const obj = JSON.parse(raw);
    return { minified: JSON.stringify(obj), error: null };
  } catch (e: any) {
    return { minified: raw, error: e.message || 'Invalid JSON syntax' };
  }
}
