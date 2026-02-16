import { AttributeDefinition } from './AttributeDefinition';

/**
 * Derives the OData navigation property name from an attribute's logical
 * name. If the logical name ends with `"id"`, the suffix is stripped.
 *
 * @param a - The attribute definition.
 * @returns The navigation property name.
 *
 * @example
 * ```ts
 * getNavigationProperty({ logicalName: 'accountid' }); // 'account'
 * getNavigationProperty({ logicalName: 'status' });     // 'status'
 * ```
 */
export function getNavigationProperty(a: AttributeDefinition) {
  return a.logicalName.endsWith('id') ? a.logicalName.slice(0, -2) : a.logicalName;
}
