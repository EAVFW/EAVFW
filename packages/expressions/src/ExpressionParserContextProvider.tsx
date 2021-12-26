import { useState } from "react";
import { ExpressionParserContext } from "./ExpressionParserContext";


export const ExpressionParserContextProvider: React.FC = ({ children }) => {

    const [variables, setVariables] = useState({});
    const [formValues, setFormValues] = useState({});

    return <ExpressionParserContext.Provider value={{
        formValues,
        setFormValues,
        appendVariables: (obj) => setVariables({ ...variables, ...obj }),
        variables
    }}>{children}</ExpressionParserContext.Provider>;
}