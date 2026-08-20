import { useState, useMemo, useCallback, useEffect } from 'react';
import type { InputSourceType, ParseError } from '../types/table';
import { parseJsonSafe, normalizeToTableRows } from '../utils/jsonHelper';
import { evaluateJsonPath, discoverArrayPaths } from '../utils/jsonPathHelper';
import { useFetchJson } from './useFetchJson';
import { SAMPLE_DATASETS } from '../utils/sampleData';
import {
  saveRawDataToIndexedDB,
  loadRawDataFromIndexedDB,
  saveAppStateToLocalStorage,
  loadAppStateFromLocalStorage,
  clearAllPersistedStorage,
} from '../utils/storageHelper';
import { parseUrlState } from '../utils/urlHelper';

export function useJsonData() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [hasSavedState, setHasSavedState] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Initial State
  const [sourceType, setSourceType] = useState<InputSourceType>('raw');
  const [rawJson, setRawJson] = useState<string>(() =>
    JSON.stringify(SAMPLE_DATASETS[0].data, null, 2)
  );
  const [url, setUrl] = useState<string>('https://dummyjson.com/products');
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);
  const [jsonPath, setJsonPath] = useState<string>(SAMPLE_DATASETS[0].path || '$');
  const [globalFilter, setGlobalFilter] = useState<string>('');

  // Initial Hydration from URL or Manual Saved State
  useEffect(() => {
    async function hydrate() {
      // 1. Check URL parameters first
      const urlState = parseUrlState();
      if (urlState) {
        setSourceType(urlState.sourceType);
        if (urlState.url) {
          setUrl(urlState.url);
          setShouldFetch(true);
        }
        if (urlState.rawJsonSnippet) {
          setRawJson(urlState.rawJsonSnippet);
        }
        if (urlState.jsonPath) {
          setJsonPath(urlState.jsonPath);
        }
        if (urlState.globalFilter) {
          setGlobalFilter(urlState.globalFilter);
        }
        setIsHydrated(true);
        return;
      }

      // 2. Check if a manually saved session exists
      const appState = loadAppStateFromLocalStorage();
      const storedRawData = await loadRawDataFromIndexedDB();

      if (appState || storedRawData) {
        setHasSavedState(true);
        if (appState?.lastUpdated) {
          setLastSavedTime(appState.lastUpdated);
        }
        if (appState?.sourceType) setSourceType(appState.sourceType);
        if (appState?.url) setUrl(appState.url);
        if (appState?.jsonPath) setJsonPath(appState.jsonPath);
        if (appState?.globalFilter) setGlobalFilter(appState.globalFilter);
        if (storedRawData) {
          setRawJson(storedRawData);
        }
        if (appState?.sourceType === 'url' && appState.url) {
          setShouldFetch(true);
        }
      }
      setIsHydrated(true);
    }

    hydrate();
  }, []);

  // Manual save action triggered ONLY when user explicitly clicks Save
  const manualSave = useCallback(async () => {
    const now = Date.now();

    // 1. Save data payload to IndexedDB
    if (rawJson && rawJson.trim()) {
      await saveRawDataToIndexedDB(rawJson);
    }

    // 2. Save app state to localStorage
    saveAppStateToLocalStorage({
      sourceType,
      url,
      jsonPath,
      isSidebarCollapsed: false,
      globalFilter,
      lastUpdated: now,
    });

    setLastSavedTime(now);
    setHasSavedState(true);
    const timeStr = new Date(now).toLocaleTimeString();
    setSaveToast(`State successfully saved at ${timeStr}`);
    setTimeout(() => setSaveToast(null), 3000);
  }, [rawJson, sourceType, url, jsonPath, globalFilter]);

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

  // Combined error
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

  // Clear data & storage
  const clearData = useCallback(async () => {
    setRawJson('');
    setUrl('');
    setJsonPath('$');
    setGlobalFilter('');
    setLastSavedTime(null);
    setHasSavedState(false);
    await clearAllPersistedStorage();
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
    globalFilter,
    setGlobalFilter,
    suggestedPaths,
    tableRows,
    currentError,
    parsedRootData,
    loadSample,
    clearData,
    manualSave,
    lastSavedTime,
    hasSavedState,
    saveToast,
    isHydrated,
  };
}
