import { RibbonViewInfo } from "@eavfw/manifest";
import { ICommandBarItemProps } from "@fluentui/react";
import  { MittEmitter } from "next/dist/shared/lib/mitt";
import { RibbonButtonProps } from "./RibbonButtonProps";
import { RibbonState } from "./RibbonState";

export type RibbonContextProps = {
    defaultRibbons: RibbonViewInfo,
    events: MittEmitter<string>;
    saveCompleted: (e: any) => void;
    //  setCanSave: (canSave: boolean)=> void;
    updateState: (state: Partial<RibbonState>) => void;
    addButton: (command: ICommandBarItemProps) => void;
    removeButton: (key: string) => void;
    registerButton: (command: ICommandBarItemProps & Partial<RibbonButtonProps>, deps?: Array<any>) => void;
}