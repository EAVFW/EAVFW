import { createContext,useContext } from "react";
import { ExpressionParserContextType } from "./ExpressionParserContextType";


export const ExpressionParserContext = createContext<ExpressionParserContextType>({
    appendVariables: (variables) => undefined,
    addExpresssion: (expression) => undefined,
    setExpressionResult: (id: string, result: any, error: any) => undefined,
    removeExpression: (id) => undefined,
    allExpressionEvaluated:false,
    formValues: {},
    variables: {},
    expressionsResults: {},
    isVariablesUpToDate: false,
    isInitialized: false,
    setFormValues: (values) => undefined
});


