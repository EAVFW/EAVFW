import { SiteMapDefinition } from "./SiteMapDefinition";

export type MultipleSiteMapDefinitions = { [key: string]: SiteMapDefinition };

export function isSingleSiteMapDefinition(obj: MultipleSiteMapDefinitions | SiteMapDefinition): obj is SiteMapDefinition {
    return obj !== undefined && "app" in obj;
}