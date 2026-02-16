import { LookupType } from './Types/Lookup/LookupType';
import { AttributeDefinition } from './AttributeDefinition';

/**
 * Narrowed {@link AttributeDefinition} for lookup and poly-lookup attributes.
 * The `type` property is guaranteed to be a {@link LookupType}.
 */
export type LookupAttributeDefinition = AttributeDefinition & {
  type: LookupType;
};
