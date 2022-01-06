import { IDropdownOption } from "@fluentui/react";

export type LookupControlState = {
    options: IDropdownOption[],
    isLoading: boolean,
    selectedKey?: string,
    modalOpen: boolean
    modalForms: Array<string>
}