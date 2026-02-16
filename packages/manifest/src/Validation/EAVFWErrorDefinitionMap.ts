import { EAVFWErrorDefinition } from './EAVFWErrorDefinition';

/** Named collection of validation error definitions keyed by attribute logical name. */
export type EAVFWErrorDefinitionMap = {
  [key: string]: EAVFWErrorDefinition;
};
