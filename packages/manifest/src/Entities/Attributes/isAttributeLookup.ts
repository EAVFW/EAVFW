import { AttributeDefinition } from './AttributeDefinition';
import { getAttributeType } from './getAttributeType';
import { LookupAttributeDefinition } from './LookupAttributeDefinition';

/**
 * Type guard that checks whether an attribute is a lookup (or poly-lookup).
 *
 * @param attribute - The attribute definition to check.
 * @returns `true` if the attribute type is `'lookup'` or `'polylookup'`.
 *
 * @example
 * ```ts
 * if (isAttributeLookup(attr)) {
 *   console.log(attr.type.referenceType);
 * }
 * ```
 */
export function isAttributeLookup(
  attribute: AttributeDefinition,
): attribute is LookupAttributeDefinition {
  const type = getAttributeType(attribute);
  return type === 'lookup' || type === 'polylookup';
}
