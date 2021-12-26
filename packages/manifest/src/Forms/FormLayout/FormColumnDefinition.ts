
export type FormColumnDefinition = {
    tab: string;
    column: string;
    section: string;
    dependant?: string;
    filter?: string;
    disabled?: boolean;
    radio_group?: string;
    control?: string | { type: string };
    readonly?: boolean;
    default?: any;
    disableCreate?: boolean;
    label?: boolean;
    visible?: boolean;
    roles?: {
        allowed?: string[]
    }
    minLength?: number;
};
