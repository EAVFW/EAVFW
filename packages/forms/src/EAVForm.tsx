
import { EAVFWErrorDefinition, isEAVFWError, ManifestDefinition, } from "@eavfw/manifest";
import { useExpressionParserContext } from "@eavfw/expressions";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { EAVFormContext } from "./EAVFormContext";

import cloneDeep from "clone-deep";

import { cleanDiff, deepDiffMapper, mergeDeep } from "@eavfw/utils";
import { EAVFormContextState } from "./EAVFormContextState";
import { EAVFormContextActions, EAVFormOnChangeCallbackContext } from "./EAVFormContextActions";
import { debug } from "console";

export type EAVFormProps<T extends {}, TState extends EAVFormContextState<T>> = {
    formDefinition?: ManifestDefinition,
    defaultData: T
    onChange?: (data: T) => void;
    state?: Omit<TState, keyof EAVFormContextState<T>>;
    onValidationResult?: (result: { errors: EAVFWErrorDefinition, calculatedFields: T, actions: EAVFormContextActions<T>, state: TState }) => void;
    stripForValidation?:(data:T)=>T
}


const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const validationFunction = process.env['NEXT_PUBLIC_BLAZOR_EVAL_VALIDATION'];



function uuidv4() {
    //@ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function mergeAndUpdate<T>(data: any, updatedFields: T): T {
    console.log("mergeAndUpdate input", JSON.stringify(data), JSON.stringify( updatedFields));

    if (updatedFields) {
         
        for (let [k, v] of Object.entries(updatedFields)) {

            console.log("mergeAndUpdate", [k, JSON.stringify(data[k]), JSON.stringify( v)]);

            if (k.endsWith("@deleted")) {
                data[k] = v.filter((c:string)=>c).concat( (data[k] ?? []).filter((vvv: string) => v.filter((vv: string) => vv === vvv).length == 0));
                console.log("deleting", [data[k], data[k.slice(0, -8)]]);
                data[k.slice(0, -8)] = data[k.slice(0, -8)].filter((n: any) => n && data[k].filter((nn:any)=>nn===n.id).length===0);
            } else if (Array.isArray(v)) {
                let a = data[k] ?? [];
              
                v.forEach((value) => {
                    let found = a.filter((n: any) => ((value.id && n.id === value.id) || (value["__id"] && n["__id"] === value["__id"])))[0];
                    console.log("mergeAndUpdate array", [k, JSON.stringify(found), JSON.stringify( value)]);
                    if (found) {
                        mergeAndUpdate(found, value)
                    } else {
                        
                        a.push(mergeAndUpdate({ "__status": "new", "__id": uuidv4() }, value))
                    }

                    //if (data[k][index]?.id && data[k + "@deleted"] && data[k + "@deleted"].indexOf(data[k][index]?.id) !== -1)
                    //    return;

                    //data[k][index] = mergeAndUpdate(data[k][index] ?? {}, value);
                });

                data[k] = a;

            } else if (typeof v === "object") {
                
                data[k] = mergeAndUpdate(data[k] ?? {}, v);

            } else if (!isEqual(data[k], v)) {
                console.log("merge", [data, data[k], k, v]);
                if (Array.isArray(data)) {
                    (data as any[]).splice(parseInt(k),1);
                } else {
                    data[k] = v;
                }


            }
        }
    }

    console.log("mergeAndUpdate output", data);
    return data;
}

type VisitedFieldElement = {
    [key: string]: VisitedFieldElementValue
};
type VisitedFieldElementValue = VisitedFieldElement | boolean | Array<VisitedFieldElement>;

const VisitedContext = createContext({
    visitedFields: {} as VisitedFieldElement,
    setVisitedFields: (visitedField: string, value: VisitedFieldElementValue) => { console.log("visited container updated", [visitedField, value]) }
});

export const useVisitedContext = () => useContext(VisitedContext);

export const VisitedContainer: React.FC<{ id: string }> = ({ id, children }) => {

    const { setVisitedFields: setParentVisitedFields} = useVisitedContext();
    const [visitedFields, setVisitedFields] = useState<VisitedFieldElement>({});
    const updateVisitedFields = useCallback((visitedField: string, value: VisitedFieldElementValue = true) => {
        if (typeof value === "boolean")
            visitedFields[visitedField] = value;
        else {
            visitedFields[visitedField] = mergeDeep(visitedFields[visitedField] ?? {}, value);
        }
        setVisitedFields({ ...visitedFields });
        setParentVisitedFields(id, visitedFields);
    }, [visitedFields,id]);

    return (<VisitedContext.Provider value={{
        visitedFields: visitedFields,
        setVisitedFields: updateVisitedFields
    }}>
        {children}
    </VisitedContext.Provider>)
}

export const EAVForm = <T extends {}, TState extends EAVFormContextState<T>>({ stripForValidation=(a)=>a,formDefinition, defaultData, onChange, children, onValidationResult, state: initialState  }: PropsWithChildren<EAVFormProps<T, TState>>) => {

    const { current: state } = useRef({
        formValues: cloneDeep(defaultData) ?? {},
        formDefinition,
        errors: {},
        fieldMetadata: {},
        ... (initialState ?? {})
    } as TState);

    const global_etag = useRef<string>(new Date().toISOString());

   // const [_errors, setLocalErrors] = useState<JsonSchemaError>();
    const [etag, setEtag] = useState(new Date().toISOString());
    
   // const { setFormValues } = useExpressionParserContext();

    const runValidation = (complete?:()=>void) => {
        if (namespace && validationFunction) {
           
            // setLocalErrors(undefined);
            const local = global_etag.current = new Date().toISOString();
            const formValuesForValidation = stripForValidation(state.formValues);

            console.log("Running Validation", [local, global_etag.current, state, formValuesForValidation]);

            DotNet.invokeMethodAsync<{ errors: EAVFWErrorDefinition, updatedFields: any }>(namespace, validationFunction, formDefinition, formValuesForValidation, true)
                .then(({ errors: results, updatedFields }) => {

                    console.log("RESULT", [results, updatedFields, local, global_etag.current, JSON.stringify(formValuesForValidation)]);



                    if (local === global_etag.current) {
                        // mergeDeep(data, updatedFields);
                        console.log("Update State", JSON.stringify(formValuesForValidation), JSON.stringify(updatedFields));
                        mergeAndUpdate(state.formValues, updatedFields);
                        console.log("Update State Complete", JSON.stringify(formValuesForValidation), JSON.stringify(updatedFields))
                        state.errors = results;

                       

                        if (onValidationResult)
                            onValidationResult({ errors: results, calculatedFields: updatedFields, actions: actions.current, state: state });
                    } 

                  
                }).catch(err => {
                    console.error(err);
                }).finally(() => {

                    if (local === global_etag.current) {
                        
                        if (onChange)
                            onChange(cloneDeep( state.formValues));

                        setEtag(global_etag.current);

                        if (complete)
                            complete();

                        console.log("Completed update", [global_etag.current, JSON.stringify(state.formValues)]);

                    } else {
                        console.log("Running validation again", [global_etag.current, JSON.stringify(state.formValues)]);
                        runValidation(complete); //Run again, state was changed;
                    }

                  
                    
                });

            return true;

        }
        return false;
    }

    const actions = useRef<EAVFormContextActions<T>>({
        runValidation: runValidation,
        updateState: (cb: (props: any) => void) => {
            console.groupCollapsed("EAVFW : UpdateState");
            try {
                console.time("Callings Calback");
                const updatedProps = cloneDeep(state);
                cb(updatedProps);
                console.timeEnd("Callings Calback");
                console.log("Updated State Props", updatedProps);

                console.time("Computing Diff");
                const a = deepDiffMapper.map(state, updatedProps);
                console.log("Updated State Diffs: ", a);
                console.timeEnd("Computing Diff");

                console.time("Running Diff");
                const [changedProp, changedValues] = cleanDiff(a);
                console.log("Updated State: ", [changedProp, changedValues]);
                console.timeEnd("Running Diff");



                if (changedProp) {

                    mergeAndUpdate(state, changedValues);

                    console.log("Merged State: ", [state]);
                    setEtag(global_etag.current = new Date().toISOString());
                }
            } finally {
                console.groupEnd();
            }
        },
        addVisited: (id: string) => {
            //if (state.visited.indexOf(id) === -1) {
            //    state.visited = state.visited.filter(c => c !== id).concat([id]);

            //    setEtag(global_etag.current = new Date().toISOString());
            //}

        },
        onChange: (cb) => {

            const updatedProps = cloneDeep(state.formValues);
            const ctx: EAVFormOnChangeCallbackContext = { skipValidation:false };
          //  const updatedProps = {};

            cb(updatedProps,ctx);

            const a = deepDiffMapper.map(state.formValues, updatedProps);
            const [changed, changedValues] = cleanDiff(a);

            console.log("Updated Props", [updatedProps, state, changed, a, changedValues, ctx]);
             

            if (changed) {
               
                mergeAndUpdate(state.formValues=cloneDeep(state.formValues), changedValues);
                console.log("Updated Props", [changed, updatedProps, JSON.stringify(state.formValues, null, 4), state]);

                if (ctx.skipValidation || !runValidation()) {
                  
                   // setFormValues({ ...data });
                    setEtag(global_etag.current = new Date().toISOString());

                    if (onChange)
                        onChange(state.formValues);

                    console.log("Updated Props Changed", [changed, state.formValues]);
                }

                console.log("Completed update", [global_etag.current, JSON.stringify(state.formValues)]);

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

    useEffect(() => {
        runValidation();
    },[]);

    return (
        <EAVFormContext.Provider
            value={{         
                actions: actions.current,
                state: state,           
                etag,           
            }}>
            <VisitedContainer id="root">
                {children}
            </VisitedContainer>
        </EAVFormContext.Provider>
    )
}