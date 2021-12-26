
import { EAVFWErrorDefinition, isEAVFWError, ManifestDefinition, } from "@eavfw/manifest";
import { useExpressionParserContext } from "@eavfw/expressions";
import { PropsWithChildren, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { EAVFormContext } from "./EAVFormContext";
import { EAVFormContextState } from "./EAVFormContextProps";

export type EAVFormProps<T extends any> = {
    formDefinition: ManifestDefinition,
    defaultData: T
}

export type JsonSchemaErrorObject = {
    __errors: Array<string>;
}
export type JsonSchemaErrorObjectWrap = {
    [key: string]: JsonSchemaError
}
export type JsonSchemaError = JsonSchemaErrorObjectWrap | JsonSchemaErrorObject | Array<JsonSchemaErrorObjectWrap | JsonSchemaErrorObject>;

const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const validationFunction = process.env['NEXT_PUBLIC_BLAZOR_EVAL_VALIDATION'];


const wrapErrors: (arg: EAVFWErrorDefinition) => JsonSchemaError =
    (errors) => {

        if (Array.isArray(errors)) {
            return errors.map((e, i) => wrapErrors(e)) as Array<JsonSchemaErrorObjectWrap | JsonSchemaErrorObject>;
        }

        if (isEAVFWError(errors)) {
            return { __errors: [errors.error] } as JsonSchemaErrorObject;
        }

        return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, wrapErrors(v)])) as JsonSchemaErrorObjectWrap;

    }



function mergeAndUpdate<T>(data: any, updatedFields: T): T {
    console.log("mergeAndUpdate input", data, updatedFields);

    if (updatedFields) {
         
        for (let [k, v] of Object.entries(updatedFields)) {

            if (Array.isArray(v)) {

                v.forEach((value, index) => { data[k][index] = mergeAndUpdate(data[k][index], value); });
            } else if (typeof v === "object") {
                data[k] = mergeAndUpdate(data[k], v);

            } else if (!isEqual(data[k], v)) {
                data[k] = v;

            }
        }
    }

    console.log("mergeAndUpdate output", data);
    return data;
}

export const EAVForm = <T extends any>({ formDefinition, defaultData, children }: PropsWithChildren<EAVFormProps<T>>) => {

    const { current: data } = useRef<EAVFormContextState<T>>({
        formValues: defaultData,
        formDefinition,
        visited: [],
        errors: {}
    });

    const global_etag = useRef<string>(new Date().toISOString());

    const [_errors, setLocalErrors] = useState<JsonSchemaError>();
    const [etag, setEtag] = useState(new Date().toISOString());
    
   // const { setFormValues } = useExpressionParserContext();

    const actions = useRef({

        onChange: (cb: (props: any) => void) => {

            const updatedProps = {};

            cb(updatedProps);

            console.log("Updated Props", updatedProps);

            let changed = false;

            let formValues = data.formValues as any;

            for (let [entry, value] of Object.entries(updatedProps)) {
                if (!isEqual(formValues[entry], value)) {
                    formValues[entry] = value;
                    changed = true;
                }
            }

            if (changed) {
                 
                if (namespace && validationFunction) {

                    setLocalErrors(undefined);
                    const local = global_etag.current = new Date().toISOString();

                    DotNet.invokeMethodAsync<{ errors: EAVFWErrorDefinition, updatedFields: any }>(namespace, validationFunction, formDefinition, data, true)
                        .then(({ errors: results, updatedFields }) => {

                            console.log("RESULT", [results, wrapErrors(results), updatedFields]);



                            if (local === global_etag.current) {
                                // mergeDeep(data, updatedFields);
                                mergeAndUpdate(data, updatedFields);


                                setLocalErrors(wrapErrors(results));
                            }
                        }).catch(err => {
                            console.error(err);
                        }).finally(() => {

                            if (local === global_etag.current) {
                              //  setFormValues({ ...data });
                                setEtag(global_etag.current);

                                console.log("Updated Props Changed", [changed, data]);

                            }
                        });


                } else {

                   // setFormValues({ ...data });
                    setEtag(global_etag.current = new Date().toISOString());

                    console.log("Updated Props Changed", [changed, data]);
                }


            }


            return data;

        },
        //setErrors: (err: ErrorObjectWrap) => {
        //    setLocalErrors(wrapErrors(err));
        //},
        //setVisitedTabs: (tabIds: string[]) => {
        //    setVisitedTabIds(tabIds);
        //},
        //setEditedFields: (fieldIds: { [k: string]: string[] }) => {
        //    setEditedFieldIds(fieldIds);
        //}

    });


    return <EAVFormContext.Provider
        value={{         
            actions: actions.current,
            state: data,           
            etag,           
        }}>{children}</EAVFormContext.Provider>
}