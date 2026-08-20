import { JSONPath } from 'jsonpath-plus';
import type { JsonPathResult } from '../types/table';

/**
 * Evaluates a JSONPath against given JSON data.
 * Supports standard JSONPath ($...) and convenience prefixes (e.g. "products" auto-prefixed with "$.").
 */
export function evaluateJsonPath(json: any, pathQuery: string): JsonPathResult {
  if (json === null || json === undefined) {
    return { data: null, path: pathQuery, isValid: true };
  }

  const trimmed = pathQuery.trim();

  // If empty or root '$', return entire json as array/object
  if (!trimmed || trimmed === '$' || trimmed === '$.') {
    if (Array.isArray(json)) {
      return { data: json, path: '$', isValid: true, matchCount: json.length };
    }
    return { data: [json], path: '$', isValid: true, matchCount: 1 };
  }

  // Normalize path: if user typed "products" instead of "$.products", allow it
  let normalizedPath = trimmed;
  if (!normalizedPath.startsWith('$')) {
    normalizedPath = normalizedPath.startsWith('.') ? `$${normalizedPath}` : `$.${normalizedPath}`;
  }

  try {
    const result = JSONPath({
      path: normalizedPath,
      json: json,
      wrap: true, // Always return array of matches
    });

    if (!result || result.length === 0) {
      return {
        data: [],
        path: normalizedPath,
        isValid: false,
        error: `No elements found matching JSONPath "${normalizedPath}"`,
        matchCount: 0,
      };
    }

    // If query was e.g. `$.products` where products is an Array, result is `[ [ { ... }, { ... } ] ]`
    // Unwrap the top level array if single match is an array
    let outputData: any[];
    if (result.length === 1 && Array.isArray(result[0])) {
      outputData = result[0];
    } else {
      outputData = result;
    }

    return {
      data: outputData,
      path: normalizedPath,
      isValid: true,
      matchCount: outputData.length,
    };
  } catch (err: any) {
    return {
      data: null,
      path: normalizedPath,
      isValid: false,
      error: `Invalid JSONPath syntax: ${err.message || String(err)}`,
      matchCount: 0,
    };
  }
}

/**
 * Finds common root keys that look like tabular arrays to suggest to user
 */
export function discoverArrayPaths(json: any, prefix = '$', depth = 0, maxDepth = 3): string[] {
  if (!json || typeof json !== 'object' || depth > maxDepth) return [];

  const paths: string[] = [];

  if (Array.isArray(json)) {
    if (prefix === '$') {
      paths.push('$');
    }
    return paths;
  }

  for (const [key, value] of Object.entries(json)) {
    const currentPath = prefix === '$' ? `$.${key}` : `${prefix}.${key}`;
    if (Array.isArray(value)) {
      paths.push(currentPath);
    } else if (value && typeof value === 'object') {
      paths.push(...discoverArrayPaths(value, currentPath, depth + 1, maxDepth));
    }
  }

  return paths;
}
