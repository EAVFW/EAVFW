import useSWR, { mutate } from "swr";
import { jsonFetcher } from "./jsonFetcher";


export function getRecordCount(entityName: string) {
    const key = `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entityName}?$top=0&$count=true`
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
        count: data?.count || 0,
        isLoading: !error && !data,
        isError: error,
        mutate: () => mutate(key)
    }
}