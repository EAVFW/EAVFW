
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

export type FormTabDefinition = {
    title: string;
    locale?: {
        [localeKey: string]: {
            title: string;
        };
    };
    columns: Required<AutoFormColumnsDefinition>["columns"],
    control?: string;
};

export function hasColumns(a: AutoFormColumnsDefinition | AutoFormControlsDefinition): a is Required<AutoFormColumnsDefinition> {
    return typeof (a) === "object" && "columns" in a;
}
export function hasControl(a: AutoFormColumnsDefinition | AutoFormControlsDefinition): a is Required<AutoFormControlsDefinition> {
    return typeof (a) === "object" && "control" in a;
}