
export interface ModelDrivenSitemapEntry {
    type: "dashboard" | "entity";
    logicalName: string;
    pluralName: string;
    viewName?: string;
    control?: string;
    title: string;
    roles?: {
        allowed?: Array<string>
    }
    locale?: {
        [key: string]: {
            displayName?: string;
            pluralName?: string;
        };
    };
    order: number;
}

