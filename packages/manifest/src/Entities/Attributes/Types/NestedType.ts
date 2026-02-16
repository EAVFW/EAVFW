import { BaseNestedType } from './BaseNestedType';
import { ChoiceType } from './Choice/ChoiceType';
import { ChoicesType } from './Choices/ChoicesType';
import { LookupType } from './Lookup/LookupType';
import { DecimalType } from './Number/DecimalType';
import { IntegerType } from './Number/IntegerType';
import { PrimitiveTypeDefinition } from './PrimitiveTypeDefinition';
import { StringType } from './String/StringType';

/**
 * Discriminated union of all structured attribute types. Each variant has a
 * `type` discriminator (e.g. `'string'`, `'choice'`, `'lookup'`). Extended
 * with {@link BaseNestedType} for shared properties like `required`.
 */
export type NestedType = BaseNestedType &
  (
    | StringType
    | ChoiceType
    | LookupType
    | IntegerType
    | DecimalType
    | ChoicesType
    | PrimitiveTypeDefinition
  );
