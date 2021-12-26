import { RibbonViewInfo } from "../Ribbon";
import { ViewColumnDefinition } from "./ViewColumnDefinition";

export type ViewDefinition = {
    type?: string,
    title?: string,
    roles?: {
        allowed?: string[]
    },
    ribbon?: RibbonViewInfo,
    columns?: {
        [column: string]: ViewColumnDefinition;

    };
}