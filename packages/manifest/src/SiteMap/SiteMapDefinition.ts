import { LocaleDefinition } from "../Localization";

export type SiteMapDefinition = {
    app: string;
    area: string;
    group: string;
    title?: string;
    dashboards?: any;
    order?: number;
    locale?: { [locale: string]: LocaleDefinition };

};


