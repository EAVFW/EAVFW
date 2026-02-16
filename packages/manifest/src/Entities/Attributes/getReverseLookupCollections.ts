import { ManifestDefinition } from '../../ManifestDefinition';
import { isAttributeLookup } from './isAttributeLookup';

/**
 * Finds all entities in the manifest that have a lookup attribute pointing
 * at `entityKey`. Useful for discovering reverse relationships.
 *
 * @param manifest - The full manifest definition to search.
 * @param entityKey - The entity key to find references to.
 * @returns An array of entity keys whose attributes reference `entityKey`.
 *
 * @example
 * ```ts
 * const related = getReverseLookupCollections(manifest, 'account');
 * // ['contact', 'order'] — entities that look up to Account
 * ```
 */
export function getReverseLookupCollections(manifest: ManifestDefinition, entityKey: string) {
  let relatedEntities = [];
  for (const [referenceEntityKey, entity] of Object.entries(manifest.entities)) {
    for (const attribute of Object.values(entity.attributes)) {
      if (isAttributeLookup(attribute) && attribute.type.referenceType === entityKey) {
        relatedEntities.push(referenceEntityKey);
      }
    }
  }
  return relatedEntities;
}
