import { DashboardDefinition, EntityDefinition, isSingleSiteMapDefinition, ManifestDefinition, PrimitiveType, SiteMapDefinition } from "@eavfw/manifest";
import { ModelDrivenAppModel } from "./ModelDrivenAppModel";

type AreasType = {
    [area: string]: {
        [group: string]: {
            [key: string]: (EntityDefinition & Required<SiteMapDefinition>)
        }
    }

};

function sortObj<T>(areas: { [key: string]: T }, sort: (a: T, ai: number, b: T, bi: number) => number, childMapper: (a: T) => T) {
    let keys = Object.keys(areas);
    return keys
        .sort((a, b) => sort(areas[a], keys.indexOf(a), areas[b], keys.indexOf(b)))
        .reduce((accumulator, key) => {

            accumulator[key] = childMapper(areas[key]);

            return accumulator;
        }, {} as any);
}

function sortAreas(areas: AreasType) {
    return sortObj(areas, (a, ai, b, bi) => {
        const aa = Math.max(-1000 + ai, Math.max(-1000 + ai, ...Object.values(a).map(x => Object.values(x).map(xx => xx.order)).flat()));
        const ab = Math.min(1000 - bi, ...Object.values(b).map(x => Object.values(x).map(xx => xx.order)).flat());
        return aa - ab;
    }, x => {
        return sortObj(x, (a, ai, b, bi) => {
            return ai - bi;
        }, x => {
            return sortObj(x, (a, ai, b, bi) => {
                return (a.order ?? ai) - (b.order ?? bi);
            }, x => x);

        });
    });
}

function isEntityDefinition(item: any): item is EntityDefinition {
    if (typeof item !== 'object' || item === null)
        return false;

    return 'logicalName' in item && typeof item.logicalName === 'string' &&
        'collectionSchemaName' in item && typeof item.collectionSchemaName === 'string' &&
        'attributes' in item && typeof item.attributes === 'object';
}

function normalizeType(attribute: { type: PrimitiveType | { type: PrimitiveType } }): void {
    if (typeof attribute.type !== "string")
        attribute.type.type = attribute.type.type.toLowerCase() as PrimitiveType;
    else
        attribute.type = attribute.type.toLowerCase() as PrimitiveType;
}

function processItems(items: { [key: string]: EntityDefinition | DashboardDefinition }, areas: any, entityMap: { [key: string]: string }, entityCollectionSchemaNameMap: { [key: string]: string }, itemType: string) {

    for (const key of Object.keys(items)) {
        const item = items[key];

        if (itemType === "entity" && isEntityDefinition(key) && item.attributes)
            Object.values((item as EntityDefinition).attributes).forEach(normalizeType);

        entityMap[key] = item.logicalName ?? key.toLowerCase().replace(/\s/g, "");
        entityCollectionSchemaNameMap[item.collectionSchemaName] = item.logicalName ?? key.toLowerCase().replace(/\s/g, "");

        let sitemaps = item.sitemap;
        if (typeof sitemaps === "object") {
            if (isSingleSiteMapDefinition(sitemaps)) sitemaps = { [`${key}dummy`]: sitemaps };

            for (const sitemapKey of Object.keys(sitemaps)) {
                const sitemap = sitemaps[sitemapKey];

                if (sitemap !== undefined && areas[sitemap.area] === undefined) areas[sitemap.area] = {};
                areas[sitemap.area][sitemap.group] = areas[sitemap.area][sitemap.group] ?? {};
                areas[sitemap.area][sitemap.group][sitemapKey] = {
                    ... (areas[sitemap.area][sitemap.group][sitemapKey]
                        ?? {
                        ...item,
                        logicalName: item.logicalName ?? key.toLowerCase().replace(/\s/g, ""),
                        title: item.locale?.["1030"]?.pluralName ?? item.pluralName, order: 0
                    }),
                    ...{
                        ...sitemap,
                        title: sitemap.title ?? sitemap.locale?.["1030"].displayName ?? sitemap.locale?.["1030"]?.pluralName ?? item.locale?.["1030"]?.pluralName ?? item.pluralName,
                        type: itemType,
                    }
                };
            }
        }
    }
}

export function generateAppContext(manifest: ManifestDefinition): ModelDrivenAppModel {
    const areas: AreasType = {};
    const entityMap: { [entityKey: string]: string } = {};
    const entityCollectionSchemaNameMap: { [entityKey: string]: string } = {};

    if (manifest.dashboards)
        processItems(manifest.dashboards, areas, entityMap, entityCollectionSchemaNameMap, 'dashboard');

    processItems(manifest.entities, areas, entityMap, entityCollectionSchemaNameMap, 'entity');

    const areaSorted = sortAreas(areas);
    const entities = Object.assign({}, ...Object.values(manifest.entities).map(o => ({ [o.logicalName]: o })));
    const dashboards = manifest.dashboards ? Object.assign({}, ...Object.entries(manifest.dashboards).map(([key, value]) => ({ [key.toLowerCase().replace(/\s/g, "")]: { ...value, key: key.toLowerCase().replace(/\s/g, "") } }))) : {};

    return {
        localization: manifest.localization,
        errorMessages: manifest.errorMessages,
        config: manifest.config,
        title: Object.keys(manifest.apps)[0],
        dashboards: dashboards,
        entities: entities,
        entityMap: entityMap,
        entityCollectionSchemaNameMap: entityCollectionSchemaNameMap,
        apps: manifest.apps,
        sitemap: { areas: areaSorted }
    };
}