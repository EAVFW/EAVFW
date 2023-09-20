import useSWR, { mutate } from "swr";
import { useClientContext } from "./clientContext";
import { useJsonFetcher } from "./jsonFetcher";

export function useSWRFetch<T = any>(path?: string, isReady = true, refreshInterval = 0) {

    const [baseUrl, jsonFetcher] = useJsonFetcher();

    const key = isReady === true ? `${baseUrl}${path}` : null;
    const { data, error } = useSWR<T>(path ? key : null,
        {
            revalidateOnFocus: false,
            revalidateOnMount: true,
            revalidateOnReconnect: false,
            refreshWhenOffline: false,
            refreshWhenHidden: false,
            refreshInterval: refreshInterval,
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