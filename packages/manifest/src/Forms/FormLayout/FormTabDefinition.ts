import { FormColumnDefinition } from "./FormColumnDefinition";
import { JSONSchema7} from "json-schema";

export type AutoFormControlsDefinition = {
    control?: string;
};
export type AutoFormHtmlDefinition = {
    html?: string;
};
export type AutoFormJsonSchemaDefinition = {
    uiSchema?: any,
    schema?: JSONSchema7;
    logicalName?: string
};
export type AutoFormFormDefinition = {
    form?: string | { entity: string, form: string }
};
export type AutoFormFieldsDefinition = {
    fields?: { [key: string]: FormColumnDefinition }
};
export type AutoFormSectionsDefinition = {
    [sectionName: string]: AutoFormColumnsDefinition | AutoFormControlsDefinition | any;
   
}
export type AutoFormColumnDefinition = {
    sections: AutoFormSectionsDefinition
    }
export type AutoFormColumnsDefinition = {
    columns?: {
        [columnName: string]: AutoFormColumnDefinition
    }
}
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>>
    & {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys]
type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
    [Property in Key]-?: Type[Property];
};
export type FormTabDefinitionBase = {
    title: string;
    locale?: {
        [localeKey: string]: {
            title: string;
        };
    };
    columns?: Required<AutoFormColumnsDefinition>["columns"],
    control?: string;
};
export type FormTabDefinition = RequireAtLeastOne<FormTabDefinitionBase, 'columns' | 'control'>
export type FormTabDefinitionWithColumns = WithRequiredProperty<Omit<FormTabDefinitionBase, 'control'>,'columns'>
export type FormTabDefinitionWithControl = WithRequiredProperty<Omit<FormTabDefinitionBase, 'columns'>, 'control'>

export type AutoFormSectionDefinition = AutoFormColumnsDefinition | AutoFormControlsDefinition | AutoFormHtmlDefinition | AutoFormFormDefinition | AutoFormFieldsDefinition | AutoFormJsonSchemaDefinition;

export function hasColumns(a: AutoFormSectionDefinition): a is Required<AutoFormColumnsDefinition> {
    return typeof (a) === "object" && "columns" in a;
}
export function hasControl(a: AutoFormSectionDefinition): a is Required<AutoFormControlsDefinition> {
    return typeof (a) === "object" && "control" in a;
}
export function hasHtml(a: AutoFormSectionDefinition): a is Required<AutoFormHtmlDefinition> {
    return typeof (a) === "object" && "html" in a;
}
export function hasForm(a: AutoFormSectionDefinition): a is Required<AutoFormFormDefinition> {
    return typeof (a) === "object" && "form" in a;
}
export function hasFields(a: AutoFormSectionDefinition): a is Required<AutoFormFieldsDefinition> {
    return typeof (a) === "object" && "fields" in a;
}

export function hasJsonSchema(a: AutoFormSectionDefinition): a is Required<AutoFormJsonSchemaDefinition> {
    return typeof (a) === "object" && "schema" in a;
}