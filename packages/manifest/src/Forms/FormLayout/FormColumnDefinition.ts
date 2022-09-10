 
import { JSONSchema7 } from "json-schema";

type addPrefixToObject<T, P extends string> = {
    [K in keyof T as K extends string ? `${P}${K}` : never]: T[K]
}

export type FormColumnDefinition = {
    tab: string;
    column: string;
    section: string;
    dependant?: string;
    filter?: string;
    entityName?: string;
    disabled?: boolean;
    radio_group?: string;
    control?: string | { type: string };
    readonly?: boolean;
    default?: any;
    disableCreate?: boolean;
    searchForLabel?: string;
    label?: boolean;
    visible?: boolean;
    roles?: {
        allowed?: string[]
    }
    minLength?: number;
    displayName?: string;
    schema?: JSONSchema7 & addPrefixToObject<any,'x-'>
};
