import { RibbonViewInfo } from '../Ribbon';
import { FormColumnDefinition, FormTabDefinition } from './FormLayout';

/**
 * Defines a form for creating or editing a single entity record. Includes
 * the form type, layout tabs, attribute column mappings, ribbon actions,
 * and lifecycle scripts.
 *
 * @example
 * ```ts
 * const form: FormDefinition = {
 *   type: 'Main',
 *   name: 'Account Main Form',
 *   layout: { tabs: { ... } },
 *   columns: { ... },
 * };
 * ```
 */
export type FormDefinition = {
  type: 'Main' | 'Modal' | 'QuickCreate';
  name: string;
  ribbon?: RibbonViewInfo;
  buttons?: {
    save?: {
      text?: string;
    };
    cancel?: {
      text?: string;
    };
  };
  query?: Record<string, unknown>;
  scripts?: {
    onInit?: {
      [name: string]: string;
    };
    preSave?: {
      [name: string]: string;
    };
  };
  layout: {
    tabs: {
      [tabName: string]: FormTabDefinition;
    };
  };
  columns: {
    [columnName: string]: FormColumnDefinition;
  };
};
