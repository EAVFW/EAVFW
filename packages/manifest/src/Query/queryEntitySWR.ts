import { useMemo } from "react";
import useSWR from "swr";
import { getNavigationProperty } from "../Entities/Attributes/getNavigationProperty";
import { isLookup } from "../Entities/Attributes/Types/Lookup/isLookup";
import { EntityDefinition } from "../Entities/EntityDefinition";
import { IRecord } from "../Types/IRecord";
import { useClientContext } from "./clientContext";
import { useJsonFetcher } from "./jsonFetcher";


function isDefined(x: any) {
    return !(typeof (x) === "undefined" || x === null || x==='');
}
export function queryEntitySWR<T extends IRecord>(entity: EntityDefinition, query: any = {}, ready = true) {

    const [baseUrl, jsonFetcher] = useJsonFetcher();

    console.log("queryEntitySWR: render", [entity.collectionSchemaName, ready, query, baseUrl]);

  

    function keyFactory() {
         
        let q = Object.keys(query).filter(k => isDefined( query[k]) ).map(k => `${k}=${query[k]}`).join('&');

        const key = `${baseUrl}/entities/${entity.collectionSchemaName}${q ? `?${q}` : ``}`;
        console.log("queryEntitySWR: keygen" + (ready ? key : null), [query]);
        return key;
    }
    const key = useMemo(() => ready ? keyFactory() : null, [query, ready]);
    const { data, error, mutate } = useSWR(key,
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
    console.log("queryEntitySWR: Result",[key,data, error]);
    return {
        data: data as { items: Array<T>, count?: number },
        isLoading: !error && !data,
        isError: error,
        mutate: mutate
    }
}