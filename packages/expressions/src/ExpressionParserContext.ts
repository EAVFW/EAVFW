import { createContext,useContext } from "react";
import { ExpressionParserContextType } from "./ExpressionParserContextType";


export const ExpressionParserContext = createContext<ExpressionParserContextType>({
    appendVariables: (variables) => undefined,
    addExpresssion: (expression) => undefined,
    removeExpression: (id) => undefined,
    formValues: {},
    variables: {},
    isVariablesUpToDate:false,
    setFormValues: (values) => undefined
});


