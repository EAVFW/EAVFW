import { useEffect, useState } from "react";
import useSWR, { mutate  } from "swr";
import { IRecord } from "../Types";
import { jsonFetcher } from "./jsonFetcher";

export function getRecordSWR(entityName: string, recordId: string, query: string = "", ready = true, initialData = undefined) {
    const key = `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entityName}/records/${recordId}${query}`;

    const [record, setRecord] = useState<IRecord | undefined>(initialData);

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

    /* Comment added for context
        useSWR will fetch in the background and in the meantime the initialData will be served.
        When useSWR is done fetching, the initialData in record will be overridden with the retrieved data,
        which is what we want in some cases.

        Consider the case when a record is created from a parent and the initialData is populated with the reference
        to that parent record. The record is new, thus non-existing considering the database and no data can be
        retrieved. Then the initial references are overwritten and the record saved with no relation to its parent.
        This case is indicated when recordId is None, then no data can be retrieved.
     */
    useEffect(() => {
        console.log("Record data is refreshed", [key,recordId, data?.value]);
        if (recordId !== undefined) {
            setRecord(data?.value);
        } else if(data?.value !== undefined){
            console.log("Error occurred in getRecordSWR. Record")
        }
    }, [data?.value])

    return {
        record: record!,
        isLoading: !error && !record,
        isError: error,
        mutate: () => mutate(key)
    }
}

