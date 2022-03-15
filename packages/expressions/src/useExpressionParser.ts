import { useEffect, useMemo, useRef, useState } from "react";
import { useExpressionParserAttributeContext } from "./ExpressionParserAttributeContext";
import { useExpressionParserContext } from "./useExpressionParserContext";


const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const expressionFunction = process.env['NEXT_PUBLIC_BLAZOR_EVAL_EXPRESSION'];

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
        

    }
}


function uuidv4() {
    //@ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export type useExpressionParserValue<T> = {
    data: T | string | undefined;
    isLoading: boolean;
    error?: string;
}

export function useExpressionParser<T = string>(expression?: string) {

    const { variables, formValues, addExpresssion } = useExpressionParserContext();
    const { attributeKey, entityKey, arrayIdx } = useExpressionParserAttributeContext();
    const id = useMemo(() => uuidv4(),[]);

    var [evaluated, setEvaluated] = useState<useExpressionParserValue<T>>(expression && expression.indexOf("@") !== -1 ?
        { data: undefined, isLoading: true, error: undefined } :
        { data: expression, isLoading: false, error: undefined });
    var etag = useRef(new Date().getTime());

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



        if (namespace && expressionFunction && expression && expression.indexOf("@") !== -1) {

            expressionResults[id] = (result: any) => { console.log(`useExpressionParser<${entityKey},${arrayIdx},${attributeKey}> result: ${expression}=${result}, id=${id}`); setEvaluated({ data: result, isLoading: false }) };
            addExpresssion(id, expression, context);
            
          //  setEvaluated({ data: "dummy", isLoading: false });

            //setTimeout(() => {
            //    console.time("useExpressionParser Queue");
            //    console.debug("useExpressionParser", [etagLocal, expression, context]);
            //    DotNet.invokeMethodAsync<T>(namespace, expressionFunction, expression, context)
            //        .then((evaluated) => {
            //            console.log("useExpressionParser result", [etagLocal, expression, context, evaluated]);
            //            if (etagLocal === etag.current) {
            //                setEvaluated({ data: evaluated, isLoading: false });
            //            }
            //        }).catch(err => {
            //            console.log("useExpressionParser error", [etagLocal, expression]);
            //            console.error(err)
            //        });
            //    console.timeEnd("useExpressionParser Queue");
            //},10);
        } else if (expression !== evaluated?.data) {
            setEvaluated({ data: expression, isLoading: false });
        }

    }, [expression]);

    return evaluated;
}