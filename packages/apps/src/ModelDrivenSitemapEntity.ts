
export interface ModelDrivenSitemapEntity {
    logicalName: string;
    pluralName: string;
    viewName?: string;
    title: string;
    roles?: {
        allowed?: Array<string>
    }
    locale?: {
        [key: string]: {
            pluralName: string;
        };
    };
    order: number;
}

