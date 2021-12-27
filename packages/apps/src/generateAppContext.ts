import { EntityDefinition, isSingleSiteMapDefinition, ManifestDefinition, PrimitiveType, SiteMapDefinition } from "@eavfw/manifest";
import { ModelDrivenAppModel } from "./ModelDrivenAppModel";

export function generateAppContext(manifest: ManifestDefinition): ModelDrivenAppModel {

    console.group("generateAppContext");
    console.log("ALERT: Generating Model");

    const areas: { [area: string]: { [group: string]: { [key: string]: EntityDefinition & Required<SiteMapDefinition> } } } = {};
    const dashboards: { [area: string]: any } = {};
    const entityMap: { [entityKey: string]: string } = {};
    const entityCollectionSchemaNameMap: { [entityKey: string]: string } = {};

    for (const entityKey of Object.keys(manifest.entities)) {
        //Fix all lowercase types on load
        for (const attribute of Object.values(manifest.entities[entityKey].attributes)) {
            if (typeof attribute.type === "object")
                attribute.type.type = attribute.type.type.toLowerCase() as PrimitiveType;
            else attribute.type = attribute.type.toLowerCase() as PrimitiveType;
        }

        const entity = manifest.entities[entityKey];
        entityMap[entityKey] = entity.logicalName;
        entityCollectionSchemaNameMap[entity.collectionSchemaName] = entity.logicalName;

        let sitemaps = entity.sitemap;
        console.log(`${entityKey} :`, sitemaps)
        if (typeof sitemaps === "object") {
            if (isSingleSiteMapDefinition(sitemaps)) sitemaps = { [`${entityKey}dummy`]: sitemaps };

            for (const sitemapKey1 of Object.keys(sitemaps)) {
                const sitemap = sitemaps[sitemapKey1];
                const sitemapKey = entityKey;

                if (sitemap !== undefined && areas[sitemap.area] === undefined) areas[sitemap.area] = {};
                if (sitemap !== undefined && dashboards[sitemap.area] === undefined) dashboards[sitemap.area] = {};

                areas[sitemap.area][sitemap.group] = areas[sitemap.area][sitemap.group] ?? {};
                console.log("Adding sitemapkey before", [sitemapKey, sitemapKey1, areas[sitemap.area][sitemap.group][sitemapKey1], entity, sitemap]);

                areas[sitemap.area][sitemap.group][sitemapKey1] = {
                    ... (areas[sitemap.area][sitemap.group][sitemapKey1]
                        ?? { ...entity, title: entity.locale?.["1030"]?.pluralName ?? entity.pluralName, order: 0 }), ...{

                            ...sitemap,
                            title: sitemap.title ?? sitemap.locale?.["1030"].displayName ?? sitemap.locale?.["1030"]?.pluralName ?? entity.locale?.["1030"]?.pluralName ?? entity.pluralName
                        }
                };
                console.log("Adding sitemapkey ater", [sitemapKey, sitemapKey1, areas[sitemap.area][sitemap.group][sitemapKey1], entity, sitemap]);
                dashboards[sitemap.area] = Object.assign(dashboards[sitemap.area], sitemap.dashboards);
            }
        }
    }

    console.log("areas:\n", areas);
    console.log("dashboards:\n", dashboards);
    const defaultApp: ModelDrivenAppModel = {
        localization: manifest.localization,
        errorMessages: manifest.errorMessages,
        config: manifest.config,
        title: Object.keys(manifest.apps)[0], // "Arbejdstid",
        entities: Object.assign({}, ...Object.values(manifest.entities).map((o) => ({ [o.logicalName]: o }))),
        entityMap: entityMap,
        entityCollectionSchemaNameMap: entityCollectionSchemaNameMap,
        apps: manifest.apps,
        sitemap: {
            dashboards,
            areas,
        },
    };

    console.groupEnd();
    return defaultApp;
}
