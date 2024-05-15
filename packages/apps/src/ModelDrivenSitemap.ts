import { ModelDrivenSitemapEntry as ModelDrivenSitemapEntry } from "./ModelDrivenSitemapEntry";

export interface ModelDrivenSitemap {
    areas: {
        [key: string]: {
            [key: string]: {
                [key: string]: ModelDrivenSitemapEntry
            };
        };
    };
}