import { EntityDefinition } from '../Entities/EntityDefinition';
import { IRecord } from '../Types/IRecord';

/**
 * Deletes a single entity record via the EAVFW API.
 *
 * @typeParam T - The record type.
 * @param entity - The entity definition.
 * @param recordId - The id of the record to delete.
 * @returns The parsed JSON response.
 *
 * @example
 * ```ts
 * await deleteRecordSWR(accountEntity, '00000000-0000-0000-0000-000000000001');
 * ```
 */
export async function deleteRecordSWR<T extends IRecord>(
  entity: EntityDefinition,
  recordId: string,
) {
  let data = (await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}/records/${recordId}`,
    { method: 'DELETE', credentials: 'include' },
  ).then((rsp) => rsp.json())) as { items: Array<T> };
  return data;
}
