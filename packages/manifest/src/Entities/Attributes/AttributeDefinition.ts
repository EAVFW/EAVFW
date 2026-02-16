import { EntityLocaleDefinition } from '../../Localization';
import { ValidationDefinitionV2, ValidationDefinitionV1 } from '../../Validation';
import { AttributeTypeDefinition } from './Types/AttributeTypeDefinition';

/**
 * Defines a single attribute on an entity. Includes display metadata,
 * type information, validation rules, and optional localization.
 *
 * @example
 * ```ts
 * const attr: AttributeDefinition = {
 *   displayName: 'Account Name',
 *   schemaName: 'AccountName',
 *   logicalName: 'accountname',
 *   type: 'string',
 * };
 * ```
 */
export type AttributeDefinition = {
  isPrimaryField?: boolean;
  isPrimaryKey?: boolean;
  isRowVersion?: boolean;
  locale?: { [locale: string]: Omit<EntityLocaleDefinition, 'pluralName'> };
  displayName: string;
  schemaName: string;
  logicalName: string;
  type: AttributeTypeDefinition;
  description?: string;
  default?: string | number | boolean;
  readonly?: boolean;
  validation?: { [validationKey: string]: ValidationDefinitionV1 | ValidationDefinitionV2 };
  metadataOnly?: boolean;
  [x: string]: unknown;
};
