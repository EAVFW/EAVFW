import { AttributeTypeDefinition } from '../AttributeTypeDefinition';
import { LookupType, PolyLookupType } from './LookupType';

/**
 * Type guard that checks whether an attribute type is a lookup or poly-lookup.
 *
 * @param type - The attribute type definition to check.
 * @returns `true` if the type is `'lookup'` or `'polylookup'`.
 *
 * @example
 * ```ts
 * if (isLookup(attr.type)) {
 *   console.log(attr.type.referenceType);
 * }
 * ```
 */
export function isLookup(type: AttributeTypeDefinition): type is LookupType {
  return (
    typeof type !== 'string' &&
    (type.type?.toLowerCase() === 'lookup' || type.type?.toLowerCase() === 'polylookup')
  );
}

/**
 * Type guard that checks whether an attribute type is specifically a poly-lookup.
 *
 * @param type - The attribute type definition to check.
 * @returns `true` if the type is `'polylookup'`.
 */
export function isPolyLookup(type: AttributeTypeDefinition): type is PolyLookupType {
  return typeof type !== 'string' && type?.type?.toLowerCase() === 'polylookup';
}
