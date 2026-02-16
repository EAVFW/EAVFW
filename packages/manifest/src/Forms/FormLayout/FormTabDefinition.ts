import { FormColumnDefinition } from './FormColumnDefinition';
import { JSONSchema7 } from 'json-schema';

/** Section definition that renders a custom control. */
export type AutoFormControlsDefinition = {
  control?: string;
};
/** Section definition that renders raw HTML content. */
export type AutoFormHtmlDefinition = {
  html?: string;
};
/** Section definition backed by a JSON Schema / RJSF form. */
export type AutoFormJsonSchemaDefinition = {
  uiSchema?: Record<string, unknown>;
  schema?: JSONSchema7;
  logicalName?: string;
};
/** Section definition that embeds another entity's form. */
export type AutoFormFormDefinition = {
  form?: string | { entity: string; form: string };
};
/** Section definition that lists specific attribute fields. */
export type AutoFormFieldsDefinition = {
  fields?: { [key: string]: FormColumnDefinition };
};
/** Named collection of form sections within a column. */
export type AutoFormSectionsDefinition = {
  [sectionName: string]: AutoFormSectionDefinition;
};
/** A single column within a form tab, containing named sections. */
export type AutoFormColumnDefinition = {
  sections: AutoFormSectionsDefinition;
};
/** Columns layout within a form tab or section. */
export type AutoFormColumnsDefinition = {
  columns?: {
    [columnName: string]: AutoFormColumnDefinition;
  };
};
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};
/** Base shape of a form tab before the at-least-one constraint is applied. */
export type FormTabDefinitionBase = {
  title: string;
  locale?: {
    [localeKey: string]: {
      title: string;
    };
  };
  columns?: Required<AutoFormColumnsDefinition>['columns'];
  control?: string;
  visibleOnCreate?: boolean;
};
/** A form tab that must have at least `columns` or `control` defined. */
export type FormTabDefinition = RequireAtLeastOne<FormTabDefinitionBase, 'columns' | 'control'>;
/** A form tab guaranteed to have `columns` (no `control`). */
export type FormTabDefinitionWithColumns = WithRequiredProperty<
  Omit<FormTabDefinitionBase, 'control'>,
  'columns'
>;
/** A form tab guaranteed to have `control` (no `columns`). */
export type FormTabDefinitionWithControl = WithRequiredProperty<
  Omit<FormTabDefinitionBase, 'columns'>,
  'control'
>;

/** Union of all possible section definition shapes within a form tab. */
export type AutoFormSectionDefinition =
  | AutoFormColumnsDefinition
  | AutoFormControlsDefinition
  | AutoFormHtmlDefinition
  | AutoFormFormDefinition
  | AutoFormFieldsDefinition
  | AutoFormJsonSchemaDefinition;

/** Type guard: section has nested `columns`. */
export function hasColumns(a: AutoFormSectionDefinition): a is Required<AutoFormColumnsDefinition> {
  return typeof a === 'object' && 'columns' in a;
}
/** Type guard: section has a custom `control`. */
export function hasControl(
  a: AutoFormSectionDefinition,
): a is Required<AutoFormControlsDefinition> {
  return typeof a === 'object' && 'control' in a;
}
/** Type guard: section has raw `html` content. */
export function hasHtml(a: AutoFormSectionDefinition): a is Required<AutoFormHtmlDefinition> {
  return typeof a === 'object' && 'html' in a;
}
/** Type guard: section embeds another entity's `form`. */
export function hasForm(a: AutoFormSectionDefinition): a is Required<AutoFormFormDefinition> {
  return typeof a === 'object' && 'form' in a;
}
/** Type guard: section has explicit `fields`. */
export function hasFields(a: AutoFormSectionDefinition): a is Required<AutoFormFieldsDefinition> {
  return typeof a === 'object' && 'fields' in a;
}

/** Type guard: section is backed by a JSON `schema`. */
export function hasJsonSchema(
  a: AutoFormSectionDefinition,
): a is Required<AutoFormJsonSchemaDefinition> {
  return typeof a === 'object' && 'schema' in a;
}
