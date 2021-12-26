import { createContext,useContext } from "react";


export type ExpressionParserAttributeContextType = {
    "attributeKey": string;
    "entityKey": string;
    "arrayIdx"?: number;
}

export const ExpressionParserAttributeContext = createContext<ExpressionParserAttributeContextType>({ attributeKey: "", entityKey: "", arrayIdx: -1 });

export const useExpressionParserAttributeContext = () => useContext(ExpressionParserAttributeContext);