import { EAVFWError } from './EAVFWError';
import { EAVFWErrorDefinitionMap } from './EAVFWErrorDefinitionMap';

/**
 * A validation error result — can be a single error, a map of nested
 * errors, or an array combining both.
 */
export type EAVFWErrorDefinition =
  | EAVFWError
  | EAVFWErrorDefinitionMap
  | Array<EAVFWError | EAVFWErrorDefinitionMap>;
