import { TypeFormDefinition, TypeFormModalDefinition } from '../../../../Forms';

/**
 * A poly-lookup attribute that can reference records from multiple entity
 * types via an intersection entity.
 */
export type PolyLookupType = {
  type: 'polylookup';
  referenceType: string;
  referenceTypes: Array<string>;
} & LookupType;
/** A simple lookup with no extra configuration. */
export type NormalLookupType = {
  type: 'lookup';
};

/**
 * Attribute type for lookup (foreign-key) relationships. Points at a
 * `referenceType` entity. Supports inline/split rendering, custom filter
 * expressions, foreign key configuration, and cascade rules.
 *
 * @example
 * ```ts
 * const type: LookupType = {
 *   type: 'lookup',
 *   referenceType: 'Account',
 * };
 * ```
 */
export type LookupType = {
  type: 'lookup' | 'polylookup';
  referenceType: string;
  referenceTypes?: Array<string>;
  inline?: boolean;
  split?: boolean;
  forms?: {
    [formKey: string]: TypeFormDefinition | TypeFormModalDefinition;
  };
  filter?: string;
  foreignKey?: {
    principalTable: string;
    principalColumn: string;
    principalNameColumn: string;
    name: string;
  };
  cascade?: {
    delete?: 'cascade' | 'noaction' | 'restrict';
    update?: 'cascade' | 'noaction' | 'restrict';
  };
};
