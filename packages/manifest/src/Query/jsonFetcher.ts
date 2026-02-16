import { useCallback } from 'react';
import { useClientContext } from './clientContext';

/**
 * Fetches JSON from the given URL with credentials included. Throws an
 * enriched `Error` (with `.info` and `.status`) on non-2xx responses.
 *
 * @param input - The request URL or `Request` object.
 * @param init - Optional `RequestInit` overrides.
 * @returns The parsed JSON response.
 */
export const jsonFetcher = async (input: RequestInfo, init: RequestInit) => {
  const res = await fetch(input, {
    ...init,
    credentials: 'include',
  });

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as Error & {
      info?: unknown;
      status?: number;
    };
    // Attach extra info to the error object.
    try {
      error.info = await res.text();
      try {
        error.info = JSON.parse(error.info as string);
      } catch (_parseError) {
        /* Response body is not JSON — keep as raw text */
      }
    } catch (_readError) {
      /* Failed to read response body — continue with no extra info */
    }
    error.status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * React hook that returns a `[baseUrl, fetcher]` tuple. The fetcher wraps
 * {@link jsonFetcher} and applies the `onRequestInit` interceptor from the
 * client context.
 *
 * @returns A tuple of `[baseUrl, fetcherFn]`.
 */
export const useJsonFetcher = () => {
  const { baseUrl, onRequestInit } = useClientContext();

  const fetcher = useCallback(
    (input: RequestInfo, init: RequestInit) => {
      if (onRequestInit) init = onRequestInit(init);

      return jsonFetcher(input, init);
    },
    [onRequestInit],
  );

  return [baseUrl, fetcher] as [string, typeof fetcher];
};
