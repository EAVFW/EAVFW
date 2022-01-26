import useSWR, { mutate  } from "swr";
import { jsonFetcher } from "./jsonFetcher";

export function getRecordSWR(entityName: string, recordId: string, query: string="", ready = true) {
    const key = `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entityName}/records/${recordId}${query}`;
    const { data, error } = useSWR(ready ? key : null,
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
        record: data?.value,
        isLoading: !error && !data,
        isError: error,
        mutate: () => mutate(key)
    }
}

