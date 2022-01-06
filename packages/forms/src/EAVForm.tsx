
import { EAVFWErrorDefinition, isEAVFWError, ManifestDefinition, } from "@eavfw/manifest";
import { useExpressionParserContext } from "@eavfw/expressions";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { EAVFormContext } from "./EAVFormContext";
import { EAVFormContextState } from "./EAVFormContextProps";

export type EAVFormProps<T extends any> = {
    formDefinition?: ManifestDefinition,
    defaultData: T
    onChange?: (data: T) => void;
    state?: any;
}


const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const validationFunction = process.env['NEXT_PUBLIC_BLAZOR_EVAL_VALIDATION'];





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

export const EAVForm = <T extends any>({ formDefinition, defaultData, onChange, children, ...props }: PropsWithChildren<EAVFormProps<T>>) => {

    const { current: state } = useRef<EAVFormContextState<T>>({
        formValues: defaultData,
        formDefinition,
        visited: [],
        errors: {},
        editedFields: {},
        ...props.state ?? {}
    });

    const global_etag = useRef<string>(new Date().toISOString());

   // const [_errors, setLocalErrors] = useState<JsonSchemaError>();
    const [etag, setEtag] = useState(new Date().toISOString());
    
   // const { setFormValues } = useExpressionParserContext();
     
    const actions = useRef({
        addVisited: (id: string) => {
            if (state.visited.indexOf(id) === -1) {
                state.visited = state.visited.filter(c => c !== id).concat([id]);

                setEtag(global_etag.current = new Date().toISOString());
            }

        },
        onChange: (cb: (props: any) => void) => {

            const updatedProps = {};

            cb(updatedProps);

            console.log("Updated Props", updatedProps);

            let changed = false;

            let formValues = state.formValues as any;

            for (let [entry, value] of Object.entries(updatedProps)) {
                if (!isEqual(formValues[entry], value)) {
                    formValues[entry] = value;
                    changed = true;
                }
            }

            if (changed) {
                 
                if (namespace && validationFunction) {

                   // setLocalErrors(undefined);
                    const local = global_etag.current = new Date().toISOString();

                    DotNet.invokeMethodAsync<{ errors: EAVFWErrorDefinition, updatedFields: any }>(namespace, validationFunction, formDefinition, state.formValues, true)
                        .then(({ errors: results, updatedFields }) => {

                            console.log("RESULT", [results, updatedFields]);



                            if (local === global_etag.current) {
                                // mergeDeep(data, updatedFields);
                                mergeAndUpdate(state.formValues, updatedFields);

                                state.errors = results; // wrapErrors(results);
                               // setLocalErrors(wrapErrors(results));
                            }
                        }).catch(err => {
                            console.error(err);
                        }).finally(() => {

                            if (local === global_etag.current) {
                              //  setFormValues({ ...data });
                                if (onChange)
                                    onChange(state.formValues);

                                setEtag(global_etag.current);

                                console.log("Updated Props Changed", [changed, state.formValues]);

                            }
                        });


                } else {

                   // setFormValues({ ...data });
                    setEtag(global_etag.current = new Date().toISOString());

                    if (onChange)
                        onChange(state.formValues);

                    console.log("Updated Props Changed", [changed, state.formValues]);
                }


            }


            return state;

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
            state: state,           
            etag,           
        }}>{children}</EAVFormContext.Provider>
}