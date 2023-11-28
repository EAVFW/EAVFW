import { RibbonViewInfo } from "../Ribbon";
import { ViewColumnDefinition } from "./ViewColumnDefinition";

export type ViewPagingDefinition = {
    enabled?: boolean;
    pageSize?: number;
}

export type ViewDefinition = {

    type?: string;
    title?: string;
    roles?: {
        allowed?: string[];
    },
    ribbon?: RibbonViewInfo,
    selection?: boolean;
    filter?: string;
    control?: string;
    paging?: boolean | ViewPagingDefinition;
    columns?: {
        [column: string]: ViewColumnDefinition;
    };
    cardIcon?: string;
}