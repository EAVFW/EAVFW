import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { useJsonFetcher } from './jsonFetcher';

/**
 * React hook that fetches the total record count for an entity using SWR.
 * Sends a `$top=0&$count=true` OData query.
 *
 * @param entityName - The entity's collection schema name.
 * @param query - Additional OData query parameters.
 * @param automaticallyrefreshtime - Polling interval in milliseconds.
 * @returns An object with `count`, `isLoading`, `isError`, and `mutate`.
 *
 * @example
 * ```tsx
 * const { count, isLoading } = getRecordCount('accounts');
 * ```
 */
export function getRecordCount(
  entityName: string,
  query: Record<string, string> = {},
  automaticallyrefreshtime = 0,
) {
  const [baseUrl, jsonFetcher] = useJsonFetcher();

  const q = useMemo(() => {
    let q = Object.keys(query)
      .filter((k) => query[k])
      .map((k) => `${k}=${query[k]}`)
      .join('&');

    if (q) q = '&' + q;
    return q;
  }, [query]);

  const key = `${baseUrl}/entities/${entityName}?$top=0&$count=true${q}`;
  const { data, error } = useSWR(key, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: automaticallyrefreshtime,
    fetcher: jsonFetcher,
  });
  return {
    count: data?.count || 0,
    isLoading: !error && !data,
    isError: error,
    mutate: () => mutate(key),
  };
}
