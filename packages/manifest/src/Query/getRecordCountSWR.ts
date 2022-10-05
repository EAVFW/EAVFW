import { useMemo } from "react";
import useSWR, { mutate } from "swr";
import { useJsonFetcher } from "./jsonFetcher";


export function getRecordCount(entityName: string, query: any = {}, automaticallyrefreshtime=0) {

    const [baseUrl, jsonFetcher] = useJsonFetcher();

    const q = useMemo(() => {
        let q = Object.keys(query).filter(k => query[k]).map(k => `${k}=${query[k]}`).join('&');

        if (q)
            q = '&' + q;
        return q;
    },[query]);

    const key = `${baseUrl}/entities/${entityName}?$top=0&$count=true${q}`
    const { data, error } = useSWR(key,
        {
            revalidateOnFocus: false,
            revalidateOnMount: true,
            revalidateOnReconnect: false,
            refreshWhenOffline: false,
            refreshWhenHidden: false,
            refreshInterval: automaticallyrefreshtime,
            fetcher: jsonFetcher
        }
    )
    console.log(data, error);
    return {
        count: data?.count || 0,
        isLoading: !error && !data,
        isError: error,
        mutate: () => mutate(key)
    }
}