import { getNavigationProperty } from "../Entities/Attributes/getNavigationProperty";
import { isLookup } from "../Entities/Attributes/Types/Lookup/isLookup";
import { EntityDefinition } from "../Entities/EntityDefinition";
import { IRecord } from "../Types/IRecord";




/**
 * Deprecated : Use queryEntitySWR
 * @param entity
 * @param query
 */

export async function queryEntity<T extends IRecord>(entity: EntityDefinition, query: any = {}) {

    let expand = Object.values(entity.attributes)
        .filter((a) => isLookup(a.type))
        .map((a) => getNavigationProperty(a))
        .join(",");
    if (expand && !('$expand' in query))
        query['$expand'] = expand;

    let q = Object.keys(query).filter(k => query[k]).map(k => `${k}=${query[k]}`).join('&');
    console.log(`Query entity: ${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}${q ? `?${q}` : ``}`)
    let data = (await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}${q ? `?${q}` : ``}`,
        { method: "GET", credentials: "include" }
    ).then((rsp) => rsp.json())) as { items: Array<T> };
    return data;
}