import { useEffect, useMemo, useRef, useState } from "react";
import { useBlazor, useUuid } from "@eavfw/hooks";
import { useExpressionParserAttributeContext, useExpressionParserLoadingContext } from "./ExpressionParserAttributeContext";
import { useExpressionParserContext } from "./useExpressionParserContext";

 
declare global {
    interface Window { expressionUpdated: any; expressionError: any;}
}

const expressionResults = {

} as any;
if (typeof global.window !== "undefined") {
    window['expressionUpdated'] = function (id:any,result:any) {
        console.log('expressionUpdated', arguments);
        setTimeout(() => {
            expressionResults[id](result);
        });

    }

    window['expressionError'] = function (id: any, error: any) {
        console.log('expressionError', arguments);
        
        setTimeout(() => {
            expressionResults[id](undefined,error);
        });
    }
}


 

export type useExpressionParserValue<T> = {
    data: T | string | undefined;
    isLoading: boolean;
    error?: string;
}

export function useExpressionParser<T = string>(expression?: string) {

    const { variables, formValues, addExpresssion, removeExpression } = useExpressionParserContext();
    const { attributeKey, entityKey, arrayIdx } = useExpressionParserAttributeContext();
  //  const blazor = useBlazor();
    const id = useUuid();

    var [evaluated, setEvaluated] = useState<useExpressionParserValue<T>>(expression && expression.indexOf("@") !== -1 ?
        { data: undefined, isLoading: true, error: undefined } :
        { data: expression, isLoading: false, error: undefined });
    var etag = useRef(new Date().getTime());
    var oldvalue = useRef(evaluated?.data);

    useExpressionParserLoadingContext(evaluated?.isLoading);

    useEffect(() => { 
        const etagLocal = etag.current = new Date().getTime();

        console.log("useExpressionParser:Form Values Changed expressions: " + expression, [etagLocal, formValues]);
        //const vars = { ...variables };

        //if ("manifest" in vars)
        //    delete vars["manifest"];

        const context = {
           // formValues,
           // variables,
            fieldInfo: {
                attributeKey,
                entityKey,
                arrayIdx
            }
        };



        if (expression && expression.indexOf("@") !== -1) {

            expressionResults[id] = (result: any, error: any) => {
                if (error) {
                    setEvaluated({ data: undefined, isLoading: false });
                    return;
                }
                console.log(`useExpressionParser<${entityKey},${arrayIdx},${attributeKey}> result: ${expression}=${result}, id=${id}`);
                if (oldvalue.current !== result) {
                    setEvaluated({ data: result, isLoading: false });
                    oldvalue.current = result;
                }
            };
            addExpresssion(id, expression, context);

            return () => {
                removeExpression(id);
            }
          
        } else if (expression !== evaluated?.data) {
            setEvaluated({ data: expression, isLoading: false });
        }

    }, [expression]);

  

    return evaluated;
}