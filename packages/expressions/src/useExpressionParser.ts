import { useEffect, useMemo, useRef, useState } from "react";
import { useBlazor, useUuid } from "@eavfw/hooks";
import { useExpressionParserAttributeContext, useExpressionParserLoadingContext } from "./ExpressionParserAttributeContext";
import { useExpressionParserContext } from "./useExpressionParserContext";

 



 

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

    useExpressionParserLoadingContext(evaluated?.isLoading, id);

    useEffect(() => { 
        const etagLocal = etag.current = new Date().getTime();

        console.log("useExpressionParser:Form Values Changed expressions: " + expression, [id,etagLocal, formValues]);
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

          
            addExpresssion(id, expression, context, (result: any, error: any) => {
                //
                console.log(`useExpressionParser<${entityKey},${arrayIdx},${attributeKey}> result: ${expression}=${result}, id=${id}, error=${error}`);

                if (error) {
                    setEvaluated({ data: undefined, isLoading: false });
                  //  setExpressionResult(id, undefined, error);
                    return;
                }
              
                if (oldvalue.current !== result) {
                    //Using an timeout to make sure the render loop is completed beforethe value is changes. If not the value can change back after the new value is placed
                    setTimeout(() => {
                        setEvaluated({ data: result, isLoading: false });
                        //     setExpressionResult(id, result, undefined);
                        oldvalue.current = result;                                 
                    }, 0);                 
                }


            });

            return () => {
                removeExpression(id);
            }
          
        } else if (expression !== evaluated?.data) {
            setEvaluated({ data: expression, isLoading: false });
        }

    }, [expression]);

  

    return evaluated;
}