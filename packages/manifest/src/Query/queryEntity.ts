import { getNavigationProperty } from '../Entities/Attributes/getNavigationProperty';
import { isLookup } from '../Entities/Attributes/Types/Lookup/isLookup';
import { EntityDefinition } from '../Entities/EntityDefinition';
import { IRecord } from '../Types/IRecord';

/**
 * Fetches entity records via a plain `fetch` call. Automatically expands
 * lookup navigation properties.
 *
 * @deprecated Use {@link queryEntitySWR} instead for SWR-based caching.
 *
 * @typeParam T - The record type.
 * @param entity - The entity definition.
 * @param query - OData query parameters.
 * @param baseUrl - API base URL (defaults to `NEXT_PUBLIC_API_BASE_URL`).
 * @returns The response containing an `items` array.
 */
export async function queryEntity<T extends IRecord>(
  entity: EntityDefinition,
  query: Record<string, string> = {},
  baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL,
) {
  let expand = Object.values(entity.attributes)
    .filter((a) => isLookup(a.type))
    .map((a) => getNavigationProperty(a))
    .join(',');
  if (expand && !('$expand' in query)) query['$expand'] = expand;

  let q = Object.keys(query)
    .filter((k) => query[k])
    .map((k) => `${k}=${query[k]}`)
    .join('&');
  let data = (await fetch(`${baseUrl}/entities/${entity.collectionSchemaName}${q ? `?${q}` : ``}`, {
    method: 'GET',
    credentials: 'include',
  }).then((rsp) => rsp.json())) as { items: Array<T> };
  return data;
}
