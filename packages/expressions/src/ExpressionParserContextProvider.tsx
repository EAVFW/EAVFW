import { useCallback, useEffect, useRef, useState } from "react";
import { ExpressionParserContext } from "./ExpressionParserContext";
import { useBlazor, useDebouncer } from "@eavfw/hooks";


const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const setVariablesFunction = process.env['NEXT_PUBLIC_BLAZOR_SET_VARIABLES'];

export const ExpressionParserContextProvider: React.FC = ({ children }) => {

    const _variables = useRef({});
    const _expresssions = useRef({});
    const [variables, setVariables] = useState(_variables.current);
    const [formValues, setFormValues] = useState({});
    const [expressions, setExpressions] = useState({});
    const { isInitialized: isBlazorInitialized } = useBlazor();
    const [isVariablesUpToDate, setIsVariablesUpToDate] = useState(false);
    //Using a ref to store variables to avoid triggering changes on the appendVariables method
    const _appendVariables = useCallback((obj: any) => { _variables.current = { ..._variables.current, ...obj }; console.log("Setting Variables: ", _variables.current); setIsVariablesUpToDate(false); setVariables(_variables.current) }, []);
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
       
        if (namespace && setVariablesFunction && isBlazorInitialized) {
            let time = new Date().getTime();    

            console.log("ExpressionParser Variables Updating: ", _variables.current);
            DotNet.invokeMethodAsync(namespace, setVariablesFunction, _variables.current)
                .then(() => {
                    console.log("ExpressionParser Variables Updated: ", _variables.current);
                    setIsVariablesUpToDate(true);
                }).catch((err) => {
                    console.error("ExpressionParser Variables Update error: ", [err, _variables.current]);
                }).finally(() => {
                    console.log("ExpressionParser Variables Updated in " + (new Date().getTime() - time), _variables.current);
                    
                 //   alert("variables set in " + (new Date().getTime() - time));
                });
        }
    }, 250, [variables, isBlazorInitialized]) as any, [variables, isBlazorInitialized]);

    
    useEffect(useDebouncer(() => {

        if (namespace && setVariablesFunction && isBlazorInitialized) {
            let time = new Date().getTime();

            console.log("ExpressionParser Expressions Updating: ", _expresssions.current);
            DotNet.invokeMethodAsync(namespace, "SetExpresssions", _expresssions.current)
                .then(() => {
                    console.log("ExpressionParser Expressions Updated: ", _expresssions.current);
                }).catch((err) => {
                    console.error("ExpressionParser Expressions Update error: ", [err, _expresssions.current]);
                }).finally(() => {
                    console.log("ExpressionParser Expressions Updated in " + (new Date().getTime() - time), _expresssions.current);
                    //   alert("variables set in " + (new Date().getTime() - time));
                });
        }
    }, 250, [expressions, isBlazorInitialized]) as any, [expressions, isBlazorInitialized]);


    return <ExpressionParserContext.Provider value={{
        formValues,
        setFormValues,
        appendVariables: _appendVariables,
        addExpresssion: _appendExpression,
        removeExpression: _removeExpresssion,
        variables,
        isVariablesUpToDate: isVariablesUpToDate
    }}>{children}</ExpressionParserContext.Provider>;
}