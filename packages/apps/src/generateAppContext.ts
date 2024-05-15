import { EntityDefinition, isSingleSiteMapDefinition, ManifestDefinition, PrimitiveType, SiteMapDefinition } from "@eavfw/manifest";
import { ModelDrivenAppModel } from "./ModelDrivenAppModel";

function sortObj<T>(areas: { [key: string]: T }, sort: (a: T, ai: number, b: T, bi: number) => number, childMapper: (a: T) => T) {
    let keys = Object.keys(areas);
    return keys
        .sort((a, b) => sort(areas[a], keys.indexOf(a), areas[b], keys.indexOf(b)))
        .reduce((accumulator, key) => {

            accumulator[key] = childMapper(areas[key]);

            return accumulator;
        }, {} as any);
}

function normalizeType(attribute: { type: PrimitiveType | { type: PrimitiveType } }): void {
    if (typeof attribute.type !== "string")
        attribute.type.type = attribute.type.type.toLowerCase() as PrimitiveType;
    else attribute.type = attribute.type.toLowerCase() as PrimitiveType;
}


export function generateAppContext(manifest: ManifestDefinition): ModelDrivenAppModel {

    const areas: {
        [area: string]: {
            [group: string]: {
                [key: string]: (EntityDefinition & Required<SiteMapDefinition>)
            }
        }
    } = {};

    const entityMap: { [entityKey: string]: string } = {};
    const entityCollectionSchemaNameMap: { [entityKey: string]: string } = {};

    for (const entityKey of Object.keys(manifest.entities)) {
        Object.values(manifest.entities[entityKey].attributes).forEach(normalizeType);

        const entity = manifest.entities[entityKey];
        entityMap[entityKey] = entity.logicalName;
        entityCollectionSchemaNameMap[entity.collectionSchemaName] = entity.logicalName;

        let sitemaps = entity.sitemap;
        if (typeof sitemaps === "object") {
            if (isSingleSiteMapDefinition(sitemaps)) sitemaps = { [`${entityKey}dummy`]: sitemaps };

            for (const sitemapKey1 of Object.keys(sitemaps)) {
                const sitemap = sitemaps[sitemapKey1];

                if (sitemap !== undefined && areas[sitemap.area] === undefined) areas[sitemap.area] = {};
                areas[sitemap.area][sitemap.group] = areas[sitemap.area][sitemap.group] ?? {};
                areas[sitemap.area][sitemap.group][sitemapKey1] = {
                    ... (areas[sitemap.area][sitemap.group][sitemapKey1]
                        ?? { ...entity, title: entity.locale?.["1030"]?.pluralName ?? entity.pluralName, order: 0 }), ...{

                            ...sitemap,
                            title: sitemap.title ?? sitemap.locale?.["1030"].displayName ?? sitemap.locale?.["1030"]?.pluralName ?? entity.locale?.["1030"]?.pluralName ?? entity.pluralName
                        }
                };
            }
        }
    }


    const areaSorted = sortObj(areas, (a, ai, b, bi) => {

        var aa = Math.max(-1000 + ai, ...Object.values(a).map(x => Object.values(x).map(xx => xx.order)).flat());
        var ab = Math.min(1000 - bi, ...Object.values(b).map(x => Object.values(x).map(xx => xx.order)).flat());

        return aa - ab;
    }, x => {

        return sortObj(x, (a, ai, b, bi) => {

            var aa = Math.max(-1000 + ai, ...Object.values(a).map(xx => xx.order));
            var ab = Math.min(1000 - bi, ...Object.values(b).map(xx => xx.order));

            return ai - bi;
        }, x => {

            return sortObj(x, (a, ai, b, bi) => {
                return (a.order ?? ai) - (b.order ?? bi);
            }, x => x);

        });
    });

    const defaultApp: ModelDrivenAppModel = {
        localization: manifest.localization,
        errorMessages: manifest.errorMessages,
        config: manifest.config,
        title: Object.keys(manifest.apps)[0], // "Arbejdstid",
        dashboards: manifest.dashboards ? Object.assign({}, ...Object.values(manifest.dashboards).map((o) => ({ [o.logicalName]: o }))) : {},
        entities: Object.assign({}, ...Object.values(manifest.entities).map((o) => ({ [o.logicalName]: o }))),
        entityMap: entityMap,
        entityCollectionSchemaNameMap: entityCollectionSchemaNameMap,
        apps: manifest.apps,
        sitemap: {
            areas: areaSorted
        },
    };

    return defaultApp;
}