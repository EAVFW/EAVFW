import { AttributeDefinition } from './AttributeDefinition';

/**
 * Extracts the type discriminator from an attribute definition. Handles both
 * primitive types (where `type` is a string) and nested types (where `type`
 * is an object with a `type` property).
 *
 * @param attribute - The attribute definition to inspect.
 * @returns The type string (e.g. `'string'`, `'lookup'`, `'choice'`).
 *
 * @example
 * ```ts
 * const type = getAttributeType(attribute);
 * if (type === 'lookup') { ... }
 * ```
 */
export function getAttributeType(attribute: AttributeDefinition) {
  return typeof attribute.type === 'string' ? attribute.type : attribute.type?.type;
}
