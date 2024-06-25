
import { LocalizationDefinition } from "./Localization"
import { DashboardDefinition, EntityDefinition } from "./Entities";

export type ManifestRoleAccessDefinition = {
    allowed?: string[]
}

export type ManifestAppSitemapDefinition = {
    groups?: {
        [key: string]: {
            title: string,
            locale?: { [locale: string]: {title:string } };
        }
    }
}
export type ManifestAppDefinition = {
    title?: string,
    roles?: ManifestRoleAccessDefinition,
    sitemap?: ManifestAppSitemapDefinition,
    [key: string]: any
}
export type ManifestAppsDefinition = {
    
    [key: string]: ManifestAppDefinition
}
export type ManifestDefinition = {
    localization?: { [locale: string]: LocalizationDefinition };
    config: any;
    variables: any;
    apps: ManifestAppsDefinition;
    entities: { [entity: string]: EntityDefinition };
    dashboards?: { [dashboard: string]: DashboardDefinition };
    errorMessages?: { [locale: string]: { [code: string]: string } };
};