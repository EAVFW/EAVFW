import React, { createContext, useCallback, useContext, useMemo, useState } from "react";


export type IFetchQuery = {
    '$top'?: number;
    '$count'?: boolean;
    '$filter'?: string;
    '$select'?: string;
    '$skip'?: number;
    '$orderby'?: string;
    '$expand'?: string;
} | undefined;
function notsupported(q: IFetchQuery) :void {
      throw new Error("Fetch Query not enabled"); 
}
const PagingContext = createContext({
    enabled: false, setTotalRecords: (n: number) => { }, fetchQuery: undefined as IFetchQuery,
    setFetchQuery: notsupported ,
    firstItemNumber: 0, lastItemNumber: undefined as number | undefined, totalRecords: undefined as number | undefined, currentPage: 0, pageSize: 0, moveNext: () => { }, movePrevious: () => { }, moveToFirst: () => { }
});
export type PagingProviderProps = {
    initialPageSize?: number,
    enabled?: boolean
}
export const PagingProvider: React.FC<PagingProviderProps> = ({ children, initialPageSize = 100, enabled = true }) => {

  
    const [lastItemNumber, setLastItemNumber] = useState<number>();
    const [totalRecords, setTotalRecords] = useState<number>();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(initialPageSize);

    const moveNext = useCallback(() => { setCurrentPage(currentPage + 1); }, [currentPage]);
    const moveToFirst = useCallback(() => { setCurrentPage(0); }, [currentPage]);
    const movePrevious = useCallback(() => { setCurrentPage(currentPage - 1); }, [currentPage]);

    const [fetchQuery, setFetchQuery] = useState<IFetchQuery>();
    


    return (
        <PagingContext.Provider value={{ enabled: enabled, setTotalRecords, fetchQuery, setFetchQuery, firstItemNumber: (fetchQuery?.$skip ?? 0) + 1, lastItemNumber: Math.min(totalRecords ?? 0, (fetchQuery?.$skip ?? 0) + pageSize), totalRecords, currentPage, pageSize, moveNext, movePrevious, moveToFirst }} >
            {children}
        </PagingContext.Provider>
    )
}
export const usePaging = () => {



    let c = useContext(PagingContext);

    if (!c.enabled) {
        const [fetchQuery, setFetchQuery] = useState<IFetchQuery>();

        return { ...c, fetchQuery, setFetchQuery };
    }

    return c;

    // return { firstItemNumber, lastItemNumber, totalRecords, currentPage, pageSize, moveNext, movePrevious, moveToFirst };
    //....
}