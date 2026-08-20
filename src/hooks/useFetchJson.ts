import { useQuery } from '@tanstack/react-query';
import type { ParseError } from '../types/table';

interface UseFetchJsonOptions {
  url: string;
  enabled: boolean;
}

export function useFetchJson({ url, enabled }: UseFetchJsonOptions) {
  return useQuery<any, ParseError>({
    queryKey: ['fetchJson', url],
    queryFn: async () => {
      if (!url || !url.trim()) {
        throw {
          message: 'URL is required to fetch data.',
          type: 'validation',
        } as ParseError;
      }

      let formattedUrl = url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      try {
        const response = await fetch(formattedUrl, {
          headers: {
            Accept: 'application/json, text/plain, */*',
          },
        });

        if (!response.ok) {
          throw {
            message: `HTTP Error ${response.status}: ${response.statusText || 'Failed to fetch'}`,
            type: 'fetch',
            details: `Status code: ${response.status}. Ensure the endpoint is accessible and allows CORS.`,
          } as ParseError;
        }

        const text = await response.text();

        if (!text.trim()) {
          throw {
            message: 'Endpoint returned an empty response.',
            type: 'validation',
          } as ParseError;
        }

        try {
          return JSON.parse(text);
        } catch {
          throw {
            message: `Response from ${formattedUrl} is not valid JSON.`,
            type: 'syntax',
            details: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
          } as ParseError;
        }
      } catch (err: any) {
        if (err.type) {
          throw err;
        }
        // Network / CORS errors
        throw {
          message: `Network request failed for ${formattedUrl}.`,
          type: 'fetch',
          details: err.message || 'Check if CORS is enabled on the remote server, or check internet connectivity.',
        } as ParseError;
      }
    },
    enabled: enabled && Boolean(url && url.trim()),
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
