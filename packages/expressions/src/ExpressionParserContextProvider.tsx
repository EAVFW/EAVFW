import { useEffect, useState } from "react";
import { ExpressionParserContext } from "./ExpressionParserContext";


export const ExpressionParserContextProvider: React.FC = ({ children }) => {

    const [variables, setVariables] = useState({});
    const [formValues, setFormValues] = useState({});

    useEffect(() => {
        console.log("ExpressionParser FormValues Updated: ", formValues);
    }, [formValues]);
    return <ExpressionParserContext.Provider value={{
        formValues,
        setFormValues,
        appendVariables: (obj) => setVariables({ ...variables, ...obj }),
        variables
    }}>{children}</ExpressionParserContext.Provider>;
}