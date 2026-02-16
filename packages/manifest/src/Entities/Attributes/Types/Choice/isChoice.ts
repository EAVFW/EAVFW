import { AttributeTypeDefinition } from '../AttributeTypeDefinition';
import { ChoiceType } from './ChoiceType';

/**
 * Type guard that checks whether an attribute type is a choice (enum).
 *
 * @param type - The attribute type definition to check.
 * @returns `true` if the type represents a choice attribute.
 *
 * @example
 * ```ts
 * if (isChoice(attr.type)) {
 *   console.log(attr.type.options);
 * }
 * ```
 */
export function isChoice(type: AttributeTypeDefinition): type is ChoiceType {
  return typeof type !== 'string' && type.type === 'choice';
}
