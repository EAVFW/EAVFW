import { NestedType } from './NestedType';
import { PrimitiveType } from './PrimitiveType';

/**
 * The type of an attribute — either a simple {@link PrimitiveType} string
 * (e.g. `'string'`, `'integer'`) or a {@link NestedType} object with
 * additional configuration (e.g. lookup target, choice options).
 */
export type AttributeTypeDefinition = PrimitiveType | NestedType;
