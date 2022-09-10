import { useMemo } from "react";
import useSWR, { mutate } from "swr";
import { jsonFetcher } from "./jsonFetcher";


export function getRecordCount(entityName: string, query: any = {}, automaticallyrefreshtime=0) {

    const q = useMemo(() => {
        let q = Object.keys(query).filter(k => query[k]).map(k => `${k}=${query[k]}`).join('&');

        if (q)
            q = '&' + q;
        return q;
    },[query]);

    const key = `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entityName}?$top=0&$count=true${q}`
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