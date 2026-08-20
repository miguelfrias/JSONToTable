import { useState, useMemo, useCallback } from 'react';
import type { InputSourceType, ParseError } from '../types/table';
import { parseJsonSafe, normalizeToTableRows } from '../utils/jsonHelper';
import { evaluateJsonPath, discoverArrayPaths } from '../utils/jsonPathHelper';
import { useFetchJson } from './useFetchJson';
import { SAMPLE_DATASETS } from '../utils/sampleData';

export function useJsonData() {
  const [sourceType, setSourceType] = useState<InputSourceType>('raw');
  const [rawJson, setRawJson] = useState<string>(() =>
    JSON.stringify(SAMPLE_DATASETS[0].data, null, 2)
  );
  const [url, setUrl] = useState<string>('https://dummyjson.com/products');
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);
  const [jsonPath, setJsonPath] = useState<string>(SAMPLE_DATASETS[0].path || '$');

  // TanStack Query for URL fetch
  const {
    data: fetchedData,
    error: fetchError,
    isLoading: isFetching,
    refetch,
  } = useFetchJson({
    url,
    enabled: sourceType === 'url' && shouldFetch,
  });

  // Parse Raw JSON or use fetched data
  const { parsedRootData, parseError } = useMemo(() => {
    if (sourceType === 'url') {
      if (fetchError) {
        return { parsedRootData: null, parseError: fetchError };
      }
      return { parsedRootData: fetchedData ?? null, parseError: null };
    }

    // Raw mode
    const { data, error } = parseJsonSafe(rawJson);
    return { parsedRootData: data, parseError: error };
  }, [sourceType, rawJson, fetchedData, fetchError]);

  // Suggested JSONPaths
  const suggestedPaths = useMemo(() => {
    if (!parsedRootData) return [];
    return discoverArrayPaths(parsedRootData);
  }, [parsedRootData]);

  // Evaluate JSONPath & Normalize to Rows
  const { tableRows, pathError } = useMemo(() => {
    if (!parsedRootData || parseError) {
      return { tableRows: [], pathError: null };
    }

    const pathResult = evaluateJsonPath(parsedRootData, jsonPath);
    if (!pathResult.isValid) {
      return {
        tableRows: [],
        pathError: {
          message: pathResult.error || 'Invalid JSONPath',
          type: 'jsonpath' as const,
        } as ParseError,
      };
    }

    const { rows } = normalizeToTableRows(pathResult.data);
    return {
      tableRows: rows,
      pathError: null,
    };
  }, [parsedRootData, parseError, jsonPath]);

  // Combined error (Syntax / Fetch / JSONPath / Validation)
  const currentError = parseError || pathError;

  // Handle URL fetch submission
  const triggerFetch = useCallback((newUrl?: string) => {
    if (newUrl !== undefined) {
      setUrl(newUrl);
    }
    setShouldFetch(true);
    setSourceType('url');
    refetch();
  }, [refetch]);

  // Load sample dataset
  const loadSample = useCallback((sampleId: string) => {
    const sample = SAMPLE_DATASETS.find((s) => s.id === sampleId);
    if (sample) {
      setSourceType('raw');
      setRawJson(JSON.stringify(sample.data, null, 2));
      setJsonPath(sample.path || '$');
    }
  }, []);

  // Clear data
  const clearData = useCallback(() => {
    setRawJson('');
    setUrl('');
    setJsonPath('$');
  }, []);

  return {
    sourceType,
    setSourceType,
    rawJson,
    setRawJson,
    url,
    setUrl,
    triggerFetch,
    isFetching,
    jsonPath,
    setJsonPath,
    suggestedPaths,
    tableRows,
    currentError,
    parsedRootData,
    loadSample,
    clearData,
  };
}
