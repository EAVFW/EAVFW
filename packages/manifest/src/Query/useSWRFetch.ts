import useSWR, { mutate } from "swr";
import { useClientContext } from "./clientContext";
import { useJsonFetcher } from "./jsonFetcher";

export function useSWRFetch(path?: string, isReady=true) {

    const [baseUrl, jsonFetcher] = useJsonFetcher();

    const key = isReady === true ? `${baseUrl}${path}` : null;
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