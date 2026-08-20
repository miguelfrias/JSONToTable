import type { InputSourceType } from '../types/table';

export interface ShareableState {
  sourceType: InputSourceType;
  url?: string;
  jsonPath?: string;
  globalFilter?: string;
  rawJsonSnippet?: string; // Optional compact snippet for small payloads
}

/**
 * Parses initial state from URL query search parameters or hash
 */
export function parseUrlState(): ShareableState | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.slice(1);
    const hashParams = new URLSearchParams(hash);

    const getParam = (key: string) => params.get(key) || hashParams.get(key);

    const url = getParam('url');
    const path = getParam('path');
    const q = getParam('q');
    const raw = getParam('raw');

    if (url) {
      return {
        sourceType: 'url',
        url: decodeURIComponent(url),
        jsonPath: path ? decodeURIComponent(path) : '$',
        globalFilter: q ? decodeURIComponent(q) : '',
      };
    }

    if (raw) {
      return {
        sourceType: 'raw',
        rawJsonSnippet: decodeURIComponent(raw),
        jsonPath: path ? decodeURIComponent(path) : '$',
        globalFilter: q ? decodeURIComponent(q) : '',
      };
    }

    if (path) {
      return {
        sourceType: 'raw',
        jsonPath: decodeURIComponent(path),
        globalFilter: q ? decodeURIComponent(q) : '',
      };
    }

    return null;
  } catch (err) {
    console.warn('Failed to parse URL state:', err);
    return null;
  }
}

/**
 * Builds a shareable URL containing current configuration
 */
export function generateShareableUrl(state: {
  sourceType: InputSourceType;
  url: string;
  jsonPath: string;
  globalFilter?: string;
  rawJson?: string;
}): string {
  if (typeof window === 'undefined') return '';

  const currentUrl = new URL(window.location.origin + window.location.pathname);
  const params = new URLSearchParams();

  if (state.sourceType === 'url' && state.url.trim()) {
    params.set('url', state.url.trim());
  } else if (state.sourceType === 'raw' && state.rawJson && state.rawJson.length < 2048) {
    // Only embed raw JSON in URL if small enough for browser URLs (<2KB)
    params.set('raw', state.rawJson);
  }

  if (state.jsonPath && state.jsonPath !== '$') {
    params.set('path', state.jsonPath);
  }

  if (state.globalFilter && state.globalFilter.trim()) {
    params.set('q', state.globalFilter.trim());
  }

  const queryString = params.toString();
  return queryString ? `${currentUrl.toString()}?${queryString}` : currentUrl.toString();
}
