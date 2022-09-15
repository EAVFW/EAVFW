import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExpressionParserContext } from "./ExpressionParserContext";
import { EnabledBlazorContextType, useBlazor, useDebouncer } from "@eavfw/hooks";


//const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const setVariablesFunction = process.env['NEXT_PUBLIC_BLAZOR_SET_VARIABLES'];


declare global {
    interface Window { expressionUpdated: any; expressionError: any; }
}

const expressionResults = {

} as any;
if (typeof global.window !== "undefined") {
    window['expressionUpdated'] = function (id: any, result: any) {
        console.log('expressionUpdated', arguments);
        setTimeout(() => {
            expressionResults[id](result);
        });

    }

    window['expressionError'] = function (id: any, error: any) {
        console.log('expressionError', arguments);

        setTimeout(() => {
            expressionResults[id](undefined, error);
        });
    }
}


export const ExpressionParserContextProvider: React.FC = ({ children }) => {

    const _variables = useRef({});
    const _expresssions = useRef({});
    const _results = useRef<any>({});
    const [variables, setVariables] = useState(_variables.current);
    const [formValues, setFormValues] = useState({});
    const [expressions, setExpressions] = useState({});
    const [results, setResults] = useState({});

    const blazor = useBlazor();
    const [isVariablesUpToDate, setIsVariablesUpToDate] = useState(true);
    const [isParserContextVariablesInitialized, setisParserContextVariablesInitialized] = useState(false);
    const [isParserContextExpressionsInitialized, setisParserContextExpressionsInitialized] = useState(false);

    //Using a ref to store variables to avoid triggering changes on the appendVariables method
    const _appendVariables = useCallback((obj: any) => {
        _variables.current = {
            ..._variables.current,
            ...obj
        };
        console.log("Setting Variables: ", _variables.current);
        setIsVariablesUpToDate(false);
        setVariables(_variables.current);
    }, []);

    const [_resultetag, set_resultetag] = useState(new Date().getTime());
    const t = useRef(0);

    const _appendExpression = useCallback((id: string, expresssion: string, context: any, oncallback: (data: any, error: any) => void) => {

        _results.current[id] = { isLoading: false };

        expressionResults[id] = (result: any, error: any) => {
            //
            oncallback(result, error);

            
            _results.current[id].data = result;
            _results.current[id].isLoading = false;
            _results.current[id].error = error;

             window.clearTimeout(t.current);
        t.current = window.setTimeout(() => {
            set_resultetag(new Date().getTime());
        },400);
          
        };

        setExpressions(_expresssions.current = {
            ..._expresssions.current,
            [id]: {
                expression: expresssion,
                context: context
            }
        });

        //setResults(_results.current = {
        //    ..._results.current,
        //    [id]: {
        //        data: undefined, isLoading: true, error: undefined
        //    }
        //});    
    }, []);
   
    

    const allEvaluated = useMemo(() => Object.values(_results.current).filter((x: any) => x.isLoading === true).length === 0, [_resultetag]);

    const _removeExpresssion = useCallback((id) => {
        let expr = { ..._expresssions.current } as any;
        delete expr[id];
        setExpressions(_expresssions.current = expr)
    }, []);

    useEffect(() => {
        console.log("ExpressionParser FormValues Updated: ", formValues);
    }, [formValues]);

    const _ti = useRef(new Date().getTime());
    const _d = useDebouncer(() => {

        if (blazor.isEnabled && setVariablesFunction && blazor.isInitialized && !isVariablesUpToDate) {
             
               const localtime= _ti.current = new Date().getTime();
            console.log(`ExpressionParser Variables Updating (${setVariablesFunction}): `, _variables.current);
            DotNet.invokeMethodAsync(blazor.namespace, setVariablesFunction, _variables.current)
                .then(() => {
                    if (localtime === _ti.current) {
                        console.log("ExpressionParser Variables Updated: ", _variables.current);
                        setIsVariablesUpToDate(true);
                        setisParserContextVariablesInitialized(true);
                    }
                }).catch((err) => {
                    console.error("ExpressionParser Variables Update error: ", [err, _variables.current]);
                }).finally(() => {
                    console.log("ExpressionParser Variables Updated in " + (new Date().getTime() - localtime), _variables.current);
                    
                    //   alert("variables set in " + (new Date().getTime() - time));
                });
        }
    }, 250, [isVariablesUpToDate, variables, blazor.isInitialized]) as any;

    useEffect(() => { _d(); }, [isVariablesUpToDate, variables, blazor.isInitialized]);
    const _tii = useRef(new Date().getTime());
    const _dd = useDebouncer(() => {

        if (blazor.isEnabled && setVariablesFunction && blazor.isInitialized) {
            
            const localtime = _tii.current = new Date().getTime();
            console.log("ExpressionParser Expressions Updating: ", _expresssions.current);
            DotNet.invokeMethodAsync(blazor.namespace, "SetExpresssions", _expresssions.current)
                .then(() => {
                    if (localtime === _tii.current) {
                        console.log("ExpressionParser Expressions Updated: ", _expresssions.current);
                        setisParserContextExpressionsInitialized(true);
                    }
                }).catch((err) => {
                    console.error("ExpressionParser Expressions Update error: ", [err, _expresssions.current]);
                }).finally(() => {
                    console.log("ExpressionParser Expressions Updated in " + (new Date().getTime() - localtime), _expresssions.current);
                    //   alert("variables set in " + (new Date().getTime() - time));

                  
                });
        }
    }, 250, [expressions, blazor.isInitialized]) as any;

    useEffect(() => { _dd(); }, [expressions, blazor.isInitialized]);
 

    return <ExpressionParserContext.Provider value={{
        isInitialized: isParserContextExpressionsInitialized && isParserContextVariablesInitialized,
        formValues,
        setFormValues,
        allExpressionEvaluated: allEvaluated,
        appendVariables: _appendVariables,
        expressionsResults: _results.current,
        addExpresssion: _appendExpression,
        removeExpression: _removeExpresssion,
        variables,
        isVariablesUpToDate: isVariablesUpToDate
    }}>{children}</ExpressionParserContext.Provider>;
}