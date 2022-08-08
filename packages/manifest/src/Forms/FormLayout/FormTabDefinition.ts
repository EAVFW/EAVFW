
export type AutoFormControlsDefinition = {
    control?: string;
};
export type AutoFormSectionsDefinition = {
    [sectionName: string]: AutoFormColumnsDefinition | AutoFormControlsDefinition | any;
   
}
export type AutoFormColumnsDefinition = {
    columns?: {
        [columnName: string]: {
            sections: AutoFormSectionsDefinition
        };
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
export type FormTabDefinitionWithControl = WithRequiredProperty<Omit<FormTabDefinitionBase, 'columns'>,'control'>

export function hasColumns(a: AutoFormColumnsDefinition | AutoFormControlsDefinition): a is Required<AutoFormColumnsDefinition> {
    return typeof (a) === "object" && "columns" in a;
}
export function hasControl(a: AutoFormColumnsDefinition | AutoFormControlsDefinition): a is Required<AutoFormControlsDefinition> {
    return typeof (a) === "object" && "control" in a;
}