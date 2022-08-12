import { useEffect, useState } from "react";
import useSWR, { mutate  } from "swr";
import { jsonFetcher } from "./jsonFetcher";

export function getRecordSWR(entityName: string, recordId: string, query: string = "", ready = true, initialData = undefined) {
    const key = `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entityName}/records/${recordId}${query}`;
   
    const [record,setRecord] = useState(initialData);

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
    console.log("getRecordSWR KEY", [key,ready,entityName,recordId, data?.value?.name]);
    useEffect(() => {
        console.log("getRecordSWR Value", data?.value);
        setRecord(data?.value);
    }, [data?.value])

    return {
        record: record,
        isLoading: !error && !data,
        isError: error,
        mutate: () => mutate(key)
    }
}

