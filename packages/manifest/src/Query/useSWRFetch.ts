import useSWR, { mutate } from 'swr';
import { useClientContext } from './clientContext';
import { useJsonFetcher } from './jsonFetcher';

/**
 * Generic SWR-based data fetching hook. Fetches JSON from `path` relative
 * to the client context base URL.
 *
 * @typeParam T - The expected response type.
 * @param path - API path appended to the base URL (e.g. `'/entities/accounts'`).
 * @param isReady - When `false`, the request is deferred until ready.
 * @param refreshInterval - Polling interval in milliseconds (`0` to disable).
 * @returns An object with `data`, `isLoading`, `error`, and a `mutate` function.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useSWRFetch<Account[]>('/entities/accounts');
 * ```
 */
export function useSWRFetch<T = unknown>(path?: string, isReady = true, refreshInterval = 0) {
  const [baseUrl, jsonFetcher] = useJsonFetcher();

  const key = isReady === true ? `${baseUrl}${path}` : null;
  const { data, error } = useSWR<T>(path ? key : null, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: refreshInterval,
    fetcher: jsonFetcher,
  });
  return {
    data,
    isLoading: !error && !data,
    error,
    mutate: () => mutate(key),
  };
}
