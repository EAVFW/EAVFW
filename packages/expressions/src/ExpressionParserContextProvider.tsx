import { useCallback, useEffect, useRef, useState } from "react";
import { ExpressionParserContext } from "./ExpressionParserContext";


export const ExpressionParserContextProvider: React.FC = ({ children }) => {

    const _variables = useRef({});
    const [variables, setVariables] = useState(_variables.current);
    const [formValues, setFormValues] = useState({});


    //Using a ref to store variables to avoid triggering changes on the appendVariables method
    const _appendVariables = useCallback((obj: any) => setVariables(_variables.current={ ..._variables.current, ...obj }), []);

    useEffect(() => {
        console.log("ExpressionParser FormValues Updated: ", formValues);
    }, [formValues]);


    return <ExpressionParserContext.Provider value={{
        formValues,
        setFormValues,
        appendVariables: _appendVariables,
        variables
    }}>{children}</ExpressionParserContext.Provider>;
}