import { useEffect, useRef, useState } from "react";
import { useExpressionParserAttributeContext } from "./ExpressionParserAttributeContext";
import { useExpressionParserContext } from "./useExpressionParserContext";


const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const expressionFunction = process.env['NEXT_PUBLIC_BLAZOR_EVAL_EXPRESSION'];


export type useExpressionParserValue<T> = {
    data: T | string | undefined;
    isLoading: boolean;
    error?: string;
}

export function useExpressionParser<T = string>(expression?: string) {

    const { variables, formValues } = useExpressionParserContext();
    const { attributeKey, entityKey, arrayIdx } = useExpressionParserAttributeContext();


    var [evaluated, setEvaluated] = useState<useExpressionParserValue<T>>(expression && expression.indexOf("@") !== -1 ?
        { data: undefined, isLoading: true, error: undefined } :
        { data: expression, isLoading: false, error: undefined });
    var etag = useRef(new Date().getTime());

    useEffect(() => {
     
       
        const etagLocal = etag.current = new Date().getTime();

        console.log("useExpressionParser:Form Values Changed expressions: " + expression, [etagLocal, formValues]);

        const context = {
            formValues,
            variables,
            fieldInfo: {
                attributeKey,
                entityKey,
                arrayIdx
            }
        };



        if (namespace && expressionFunction && expression && expression.indexOf("@") !== -1) {

            console.debug("useExpressionParser", [etagLocal, expression, context]);

            DotNet.invokeMethodAsync<T>(namespace, expressionFunction, expression, context)
                .then((evaluated) => {
                    console.log("useExpressionParser result", [etagLocal,expression, context, evaluated]);
                    if (etagLocal === etag.current) {
                        setEvaluated({ data: evaluated, isLoading: false });
                    }
                }).catch(err => {
                    console.log("useExpressionParser error", [etagLocal, expression]);
                    console.error(err)
                });
        } else if (expression !== evaluated?.data) {
            setEvaluated({ data: expression, isLoading: false });
        }

    }, [expression, variables, formValues]);

    return evaluated;
}