export type InputSourceType = 'raw' | 'url';

export interface ParseError {
  message: string;
  line?: number;
  column?: number;
  type: 'syntax' | 'fetch' | 'jsonpath' | 'validation' | 'render';
  details?: string;
}

export interface JsonPathResult {
  data: any[] | null;
  path: string;
  isValid: boolean;
  error?: string;
  matchCount?: number;
}

export type TableRowData = Record<string, any>;

export interface ColumnMeta {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  isNested?: boolean;
}

export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  path?: string;
  data: any;
}
