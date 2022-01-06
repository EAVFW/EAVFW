import { ICommandBarItemProps } from "@fluentui/react";

export type RibbonState = {
    canSave: boolean;
    skipRedirect: boolean;
    buttons: ICommandBarItemProps[];
}