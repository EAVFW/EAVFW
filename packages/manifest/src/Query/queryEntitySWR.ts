import { useMemo } from 'react';
import useSWR from 'swr';
import { getNavigationProperty } from '../Entities/Attributes/getNavigationProperty';
import { isLookup } from '../Entities/Attributes/Types/Lookup/isLookup';
import { EntityDefinition } from '../Entities/EntityDefinition';
import { IRecord } from '../Types/IRecord';
import { useClientContext } from './clientContext';
import { useJsonFetcher } from './jsonFetcher';

function isDefined(x: unknown) {
  return !(typeof x === 'undefined' || x === null || x === '');
}
/**
 * React hook that fetches multiple entity records using SWR. Automatically
 * builds the OData query URL from the entity definition.
 *
 * @typeParam T - The record type.
 * @param entity - The entity definition (used for `collectionSchemaName`).
 * @param query - OData query parameters as an object or pre-built string.
 * @param ready - When `false`, the fetch is deferred.
 * @returns An object with `data` (containing `items` array and optional
 *   `count`), `isLoading`, `isError`, and `mutate`.
 *
 * @example
 * ```tsx
 * const { data } = queryEntitySWR<Account>(accountEntity, { '$top': '10' });
 * ```
 */
export function queryEntitySWR<T extends IRecord>(
  entity: EntityDefinition,
  query: Record<string, string> | string = {},
  ready = true,
) {
  const [baseUrl, jsonFetcher] = useJsonFetcher();

  function keyFactory() {
    let q =
      typeof query === 'string'
        ? query
        : Object.keys(query)
            .filter((k) => isDefined(query[k]))
            .map((k) => `${k}=${query[k]}`)
            .join('&');

    const key = `${baseUrl}/entities/${entity.collectionSchemaName}${q ? `?${q}` : ``}`;
    return key;
  }
  const key = useMemo(() => (ready ? keyFactory() : null), [query, ready]);
  const { data, error, mutate } = useSWR(key, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
    fetcher: jsonFetcher,
  });
  return {
    data: data as { items: Array<T>; count?: number },
    isLoading: !error && !data,
    isError: error,
    mutate: mutate,
  };
}
