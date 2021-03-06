import { useMemo } from "react";
import useSWR, { mutate } from "swr";
import { getNavigationProperty } from "../Entities/Attributes/getNavigationProperty";
import { isLookup } from "../Entities/Attributes/Types/Lookup/isLookup";
import { EntityDefinition } from "../Entities/EntityDefinition";
import { IRecord } from "../Types/IRecord";
import { jsonFetcher } from "./jsonFetcher";


export function queryEntitySWR<T extends IRecord>(entity: EntityDefinition, query: any = {}, ready = true) {


    
    function keyFactory() {
        let expand = Object.values(entity.attributes)
            .filter((a) => isLookup(a.type))
            .map((a) => getNavigationProperty(a))
            .join(",");
        if (expand && !('$expand' in query))
            query['$expand'] = expand;

        let q = Object.keys(query).filter(k => query[k]).map(k => `${k}=${query[k]}`).join('&');

        const key = `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}${q ? `?${q}` : ``}`;
        console.log("queryEntitySWR: " + (ready ? key : null), [query]);
        return key;
    }
    const key = useMemo(() => ready ? keyFactory() : null, [query, ready]);
    const { data, error } = useSWR(key,
        {
            revalidateOnFocus: false,
            revalidateOnMount: true,
            revalidateOnReconnect: false,
            refreshWhenOffline: false,
            refreshWhenHidden: false,
            refreshInterval: 0,
            fetcher: jsonFetcher
        }
    )
    console.log(data, error);
    return {
        data: data as { items: Array<T> },
        isLoading: !error && !data,
        isError: error,
        mutate: () => mutate(key)
    }
}