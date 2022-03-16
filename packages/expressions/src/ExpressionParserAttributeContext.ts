import { createContext,Dispatch,SetStateAction,useContext, useEffect } from "react";
import { useUuid } from "@eavfw/hooks";


export type ExpressionParserAttributeContextType = {
    "attributeKey": string;
    "entityKey": string;
    "arrayIdx"?: number;
    isLoading: boolean;
    setIsLoading: (id: string, isLoading: boolean) => void;
}

export const ExpressionParserAttributeContext = createContext<ExpressionParserAttributeContextType>({ isLoading:false, attributeKey: "", entityKey: "", arrayIdx: -1, setIsLoading: () => { } });

export const useExpressionParserAttributeContext = () => useContext(ExpressionParserAttributeContext);
export const useExpressionParserLoadingContext = (isLoading: boolean) => {

    const { setIsLoading, attributeKey } = useExpressionParserAttributeContext();
    const id = useUuid();

    useEffect(() => {
        console.log("Loading changed for " + attributeKey);
        setIsLoading(id, isLoading);
    }, [isLoading]);
}