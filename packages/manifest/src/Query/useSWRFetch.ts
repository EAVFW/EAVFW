import useSWR, { mutate } from "swr";
import { jsonFetcher } from "./jsonFetcher";

export function useSWRFetch(path?: string) {
    const key = `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;
    const { data, error } = useSWR(path ? key : null,
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
        data,
        isLoading: !error && !data,
        error,
        mutate: () => mutate(key)
    }
}