import { RibbonViewInfo } from "../Ribbon";
import { ViewColumnDefinition } from "./ViewColumnDefinition";

export type ViewDefinition = {
    type?: string,
    title?: string,
    roles?: {
        allowed?: string[]
    },
    ribbon?: RibbonViewInfo,
    selection?: boolean;
    filter?: string,
    columns?: {
        [column: string]: ViewColumnDefinition;

    };
}