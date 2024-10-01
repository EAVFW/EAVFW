import { DashboardDefinition, EntityDefinition, isSingleSiteMapDefinition, ManifestDefinition, PrimitiveType, SiteMapDefinition, EntityLocaleDefinition, MultipleSiteMapDefinitions, ManifestAppsDefinition } from "@eavfw/manifest";
import { ModelDrivenAppModel } from "./Model/ModelDrivenAppModel";

type AreasType = {
    [area: string]: {
        [group: string]: {
            [key: string]: Required<SiteMapDefinition>
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

function getTitle(item: EntityDefinition | DashboardDefinition, sitemap: any, locale: string): string {

    //let selectedLocale = item.locale?.[locale];

    //let title = selectedLocale && "pluralName" in selectedLocale ? selectedLocale.pluralName :
    //    (selectedLocale?.displayName ?? item.pluralName ?? item.displayName)

    //return title;

    const title = sitemap.title ?? sitemap.locale?.[locale].pluralName ?? sitemap.locale?.[locale]?.displayName ?? (item.locale?.[locale] as EntityLocaleDefinition)?.pluralName;
    if (title === undefined && item.locale?.["1030"] && (item.locale["1030"] as EntityLocaleDefinition).pluralName !== 'undefined') {
        return (item.locale["1030"] as EntityLocaleDefinition).pluralName ?? item.displayName ?? item.pluralName;
    }
    return title ?? item.pluralName ?? item.displayName;
}


function getLogicalName(item: EntityDefinition | DashboardDefinition, key: string): string {
    return item.logicalName ?? key.toLowerCase().replace(/\s/g, "");
}

function processSitemap(apps: ManifestAppsDefinition,
    key: string,
    item: EntityDefinition | DashboardDefinition,
    sitemaps: MultipleSiteMapDefinitions | SiteMapDefinition | undefined,
    areas: AreasType, itemType: string,locale:string) {

    if (typeof sitemaps === "object") {
        if (isSingleSiteMapDefinition(sitemaps))
            sitemaps = { [`${key}dummy`]: sitemaps };

        const test = sitemaps;
        console.log("sitemaps", test);
        for (const sitemapKey of Object.keys(sitemaps).sort((sitemapKeyA, sitemapKeyB) => (test[sitemapKeyA].order ?? Infinity) - (test[sitemapKeyB].order ?? Infinity))) {
            const sitemap = sitemaps[sitemapKey];
            const app = apps[sitemap.app];
           


            if (sitemap !== undefined && areas[sitemap.area] === undefined)
                areas[sitemap.area] = {};


            const groupTitle = app?.sitemap?.groups?.[sitemap.group]?.locale?.[locale]?.title ?? app?.sitemap?.groups?.[sitemap.group]?.title ?? sitemap.group;



            areas[sitemap.area][groupTitle] = areas[sitemap.area][groupTitle] ?? {};

            let selectedLocale = item.locale?.[locale];

            let title = selectedLocale && "pluralName" in selectedLocale ? selectedLocale.pluralName :
                (selectedLocale?.displayName ?? item.pluralName ?? item.displayName)

           // if (title === undefined && selectedLocale && (item.locale[locale] as EntityLocaleDefinition).pluralName !== 'undefined') {
           //     title = (item.locale[locale] as EntityLocaleDefinition).pluralName ?? item.displayName ?? item.pluralName;
           // }

            const sitemapEntry = {
                ... (areas[sitemap.area][groupTitle][sitemapKey]
                    ?? {
                    ...item,
                    logicalName: getLogicalName(item, key),
                    title: title ?? item.pluralName ?? item.displayName,
                    order: 0
                }),
                ...{
                    ...sitemap,
                    title: getTitle(item, sitemap,locale),
                    type: itemType
                    
                }
            };
            console.log("sitemapEntry", [sitemapEntry, sitemap,locale, item.locale, selectedLocale, sitemapEntry.title, title ?? item.pluralName ?? item.displayName, getTitle(item, sitemap, locale)]);
            areas[sitemap.area][groupTitle][sitemapKey] = sitemapEntry;
        }
    }
}


function processItems(
    apps: ManifestAppsDefinition,
    items: { [key: string]: EntityDefinition | DashboardDefinition },
    areas: AreasType,
    entityMap: { [key: string]: string },
    entityCollectionSchemaNameMap: { [key: string]: string },
    itemType: string,
    locale: string) {

    function getOrder(sitemap: SiteMapDefinition | MultipleSiteMapDefinitions | undefined): number {
        let order = sitemap?.order;
        if(typeof order === "number")
            return order;
        return Infinity;
    }
    
    for (const key of Object.keys(items).sort((a, b) => getOrder(items[a].sitemap) - getOrder(items[b].sitemap))) {
        const item = items[key];



        if (itemType === "entity" && isEntityDefinition(item) && item.attributes)
            Object.values((item as EntityDefinition).attributes).forEach(normalizeType);

        entityMap[key] = getLogicalName(item, key);
        entityCollectionSchemaNameMap[item.collectionSchemaName] = getLogicalName(item, key);


        processSitemap(apps, key, item, item.sitemap, areas, itemType,locale);


    }
}

export function generateAppContext(manifest: ManifestDefinition, locale: string): ModelDrivenAppModel {
    const areas: AreasType = {};
    const entityMap: { [entityKey: string]: string } = {};
    const entityCollectionSchemaNameMap: { [entityKey: string]: string } = {};

    if (manifest.dashboards)
        processItems(manifest.apps, manifest.dashboards, areas, entityMap, entityCollectionSchemaNameMap, 'dashboard', locale);

    processItems(manifest.apps, manifest.entities, areas, entityMap, entityCollectionSchemaNameMap, 'entity', locale);

    const areaSorted = sortAreas(areas);
    const entities = Object.assign({}, ...Object.values(manifest.entities).map(o => ({ [o.logicalName]: o })));
    const dashboards = manifest.dashboards ? Object.assign({}, ...Object.entries(manifest.dashboards).map(([key, value]) => ({ [key.toLowerCase().replace(/\s/g, "")]: { ...value, key: key.toLowerCase().replace(/\s/g, "") } }))) : {};

    const appcontext = {
        localization: manifest.localization,
        errorMessages: manifest.errorMessages,
        config: manifest.config,
        title: Object.keys(manifest.apps)[0],
        dashboards: dashboards,
        entities: entities,
        entityMap: entityMap,
        entityCollectionSchemaNameMap: entityCollectionSchemaNameMap,
        apps: manifest.apps,
        sitemap: { areas: areaSorted, dashboards: {} },
    };

    return appcontext;
}