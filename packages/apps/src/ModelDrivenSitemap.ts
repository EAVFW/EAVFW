import { ModelDrivenSitemapEntry } from "./ModelDrivenSitemapEntry";

export interface ModelDrivenSitemap {
    // dashboards is deprecated and should be removed

    dashboards: {
        [area: string]: {
            [dashboard: string]: {
                url: string
            }
        }
    },

    areas: {
        [key: string]: {
            [key: string]: {
                [key: string]: ModelDrivenSitemapEntry
            };
        };
    };
}