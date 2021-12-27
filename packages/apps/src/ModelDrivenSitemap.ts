import { ModelDrivenSitemapEntity } from "./ModelDrivenSitemapEntity";

export interface ModelDrivenSitemap {
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

                [key: string]: ModelDrivenSitemapEntity
            };
        };
    };
}