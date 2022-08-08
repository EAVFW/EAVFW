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

const PagingContext = createContext({ setTotalRecords: (n: number) => { } ,fetchQuery: {} as IFetchQuery, setFetchQuery: (q: IFetchQuery) => { }, firstItemNumber: 0, lastItemNumber: undefined as number | undefined, totalRecords: undefined as number | undefined, currentPage: 0, pageSize: 0, moveNext: () => { }, movePrevious: () => { }, moveToFirst: () => { } });
export const PagingProvider: React.FC = ({ children }) => {

  
    const [lastItemNumber, setLastItemNumber] = useState<number>();
    const [totalRecords, setTotalRecords] = useState<number>();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);

    const moveNext = useCallback(() => { setCurrentPage(currentPage + 1); }, [currentPage]);
    const moveToFirst = useCallback(() => { setCurrentPage(0); }, [currentPage]);
    const movePrevious = useCallback(() => { setCurrentPage(currentPage - 1); }, [currentPage]);

    const [fetchQuery, setFetchQuery] = useState<IFetchQuery>();
    


    return (
        <PagingContext.Provider value={{ setTotalRecords, fetchQuery, setFetchQuery, firstItemNumber: (fetchQuery?.$skip ?? 0) + 1, lastItemNumber: Math.min(totalRecords??0,(fetchQuery?.$skip ?? 0) + pageSize), totalRecords, currentPage, pageSize, moveNext, movePrevious, moveToFirst }} >
            {children}
        </PagingContext.Provider>
    )
}
export const usePaging = () => {



    return useContext(PagingContext);

    // return { firstItemNumber, lastItemNumber, totalRecords, currentPage, pageSize, moveNext, movePrevious, moveToFirst };
    //....
}