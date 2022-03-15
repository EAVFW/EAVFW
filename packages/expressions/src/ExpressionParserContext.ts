import { createContext,useContext } from "react";
import { ExpressionParserContextType } from "./ExpressionParserContextType";


export const ExpressionParserContext = createContext<ExpressionParserContextType>({
    appendVariables: (variables) => undefined,
    addExpresssion: (expression) => undefined,
    formValues: {},
    variables: {},
    setFormValues: (values) => undefined
});


