 
import { JSONSchema7 } from "json-schema";
import { CSSProperties } from "react";

type addPrefixToObject<T, P extends string> = {
    [K in keyof T as K extends string ? `${P}${K}` : never]: T[K]
}

export type FormColumnDefinition = {
    query?: { expand: boolean };
    rows?: number;
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
    styles?: {
        field?: CSSProperties;
        container?: CSSProperties;
    },
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
