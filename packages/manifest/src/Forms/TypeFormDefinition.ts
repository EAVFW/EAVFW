import { RibbonViewInfo } from "../Ribbon";

export type TypeFormDefinition = {
    type: "Main";
    name: string;
    tab: string;
    column: string;
    section: string;
    view?: string;
    ribbon?: RibbonViewInfo,
};