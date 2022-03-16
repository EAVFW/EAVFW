import { useCallback, useEffect, useRef, useState } from "react";
import { ExpressionParserContext } from "./ExpressionParserContext";
import { useDebouncer } from "@eavfw/hooks";


const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const setVariablesFunction = process.env['NEXT_PUBLIC_BLAZOR_SET_VARIABLES'];

export const ExpressionParserContextProvider: React.FC = ({ children }) => {

    const _variables = useRef({});
    const _expresssions = useRef({});
    const [variables, setVariables] = useState(_variables.current);
    const [formValues, setFormValues] = useState({});
    const [expressions, setExpressions] = useState({});


    //Using a ref to store variables to avoid triggering changes on the appendVariables method
    const _appendVariables = useCallback((obj: any) => setVariables(_variables.current = { ..._variables.current, ...obj }), []);
    const _appendExpression = useCallback((id: string, expresssion: string, context: any) => setExpressions(_expresssions.current = { ..._expresssions.current, [id]: { expression: expresssion, context: context } }), []);
    const _removeExpresssion = useCallback((id) => {
        let expr = { ..._expresssions.current } as any;
        delete expr[id];
        setExpressions(_expresssions.current = expr)
    }, []);
    useEffect(() => {
        console.log("ExpressionParser FormValues Updated: ", formValues);
    }, [formValues]);

    useEffect(useDebouncer(() => {
       
        if (namespace && setVariablesFunction) {
            let time = new Date().getTime();    
             
            console.log("ExpressionParser Variables Updating: ", variables);
            DotNet.invokeMethodAsync(namespace, setVariablesFunction, variables)
                .then(() => {
                    console.log("ExpressionParser Variables Updated: ", variables);
                }).catch((err) => {
                    console.error("ExpressionParser Variables Update error: ",[err, variables]);
                }).finally(() => {
                    console.log("ExpressionParser Variables Updated in " + (new Date().getTime() - time), variables);
                 //   alert("variables set in " + (new Date().getTime() - time));
                });
        }
    }, 250, [variables]) as any, [variables]);

    
    useEffect(useDebouncer(() => {

        if (namespace && setVariablesFunction) {
            let time = new Date().getTime();

            console.log("ExpressionParser Expressions Updating: ", expressions);
            DotNet.invokeMethodAsync(namespace, "SetExpresssions", expressions)
                .then(() => {
                    console.log("ExpressionParser Expressions Updated: ", expressions);
                }).catch((err) => {
                    console.error("ExpressionParser Expressions Update error: ",[ err, expressions]);
                }).finally(() => {
                    console.log("ExpressionParser Expressions Updated in " + (new Date().getTime() - time), expressions);
                    //   alert("variables set in " + (new Date().getTime() - time));
                });
        }
    }, 250, [expressions]) as any, [expressions]);


    return <ExpressionParserContext.Provider value={{
        formValues,
        setFormValues,
        appendVariables: _appendVariables,
        addExpresssion: _appendExpression,
        removeExpression: _removeExpresssion,
        variables
    }}>{children}</ExpressionParserContext.Provider>;
}