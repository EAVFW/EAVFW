
import { EAVFWErrorDefinition, isEAVFWError, ManifestDefinition, } from "@eavfw/manifest";
import { useExpressionParserContext } from "@eavfw/expressions";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { EAVFormContext } from "./EAVFormContext";

import cloneDeep from "clone-deep";

import { cleanDiff, deepDiffMapper, mergeDeep } from "@eavfw/utils";
import { EAVFormContextState } from "./EAVFormContextState";
import { EAVFormContextActions, EAVFormOnChangeCallbackContext } from "./EAVFormContextActions";

import { useUuid } from "@eavfw/hooks";

export type EAVFormProps<T extends {}, TState extends EAVFormContextState<T>> = {
    formDefinition?: ManifestDefinition,
    defaultData: T
    onChange?: (data: T) => void;
    state?: Omit<TState, keyof EAVFormContextState<T>>;
    onValidationResult?: (result: { errors: EAVFWErrorDefinition, actions: EAVFormContextActions<T>, state: TState }) => void;
    stripForValidation?:(data:T)=>T
}


const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
const validationFunction = process.env['NEXT_PUBLIC_BLAZOR_EVAL_VALIDATION'];




declare global {
    interface Window { formValuesUpdate: any;  }
}


const callbacks: { [key: string]: Function } = {

}

if (typeof global.window !== "undefined") {
    window['formValuesUpdate'] = function (id:string,etag:string,validations:any) {
        console.log('formValuesUpdate', arguments);

        if (id in callbacks) {
            callbacks[id](etag, validations);
        }
    }
 
}


function uuidv4() {
    //@ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
function isDefined(v: any) {
    return !(v === null || typeof v === "undefined");
}
function mergeAndUpdate<T>(data: any, updatedFields: T): T {
    console.log("mergeAndUpdate input", JSON.stringify(data), JSON.stringify( updatedFields));

    if (updatedFields) {
         
        for (let [k, v] of Object.entries(updatedFields)) {

            console.log("mergeAndUpdate", [k, JSON.stringify(data[k]), JSON.stringify( v)]);

            if (k.endsWith("@deleted") && data[k] && isDefined(v)) {
                console.log("", [data[k] , v])
                data[k] = v.filter((c:string)=>c).concat( (data[k] ?? []).filter((vvv: string) => v.filter((vv: string) => vv === vvv).length == 0));
                console.log("deleting", [data[k], data[k.slice(0, -8)]]);
                data[k.slice(0, -8)] = data[k.slice(0, -8)].filter((n: any) => n && data[k].filter((nn:any)=>nn===n.id).length===0);
            } else if (Array.isArray(v)) {
                let a = data[k] ?? [];
              
                //v.forEach((value) => {
                //    let found = a.filter((n: any) => ((value.id && n.id === value.id) || (value["__id"] && n["__id"] === value["__id"])))[0];
                //    console.log("mergeAndUpdate array", [k, JSON.stringify(found), JSON.stringify( value)]);
                //    if (found) {
                //        mergeAndUpdate(found, value)
                //    } else {
                        
                //        a.push(mergeAndUpdate({ "__status": "new", "__id": uuidv4() }, value))
                //    }

                //    //if (data[k][index]?.id && data[k + "@deleted"] && data[k + "@deleted"].indexOf(data[k][index]?.id) !== -1)
                //    //    return;

                //    //data[k][index] = mergeAndUpdate(data[k][index] ?? {}, value);
                //});

                v.forEach((value, index) => {
                    let va = mergeAndUpdate(a[index] ?? value, value);
                    if (isDefined(va))
                        a[index] = va;
                });

                data[k] = a;
               

            } else if (typeof v === "object" && v !== null) {
                
                data[k] = mergeAndUpdate(data[k] ?? {}, v);

            } else if ((isDefined(data[k]) || isDefined(v)) && !isEqual(data[k], v)) { //Dont consider null and undefined a difference
                console.log("merge", [data, data[k], k, v]);
                if (Array.isArray(data)) {
                    (data as any[]).splice(parseInt(k),1);
                } else {
                   
                    if (isDefined(data[k]) && !isDefined(v))
                        delete data[k];
                    else
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

    const { setVisitedFields: setParentVisitedFields, visitedFields: rootVisitedFields } = useVisitedContext();
    const refVisitedFields = useRef<VisitedFieldElement>({});
    const [visitedFields, setVisitedFields] = useState<VisitedFieldElement>(refVisitedFields.current);
    const updateVisitedFields = useCallback((visitedField: string, value: VisitedFieldElementValue = true) => {
        console.log("Setting visible field " + visitedField, [value, JSON.stringify( refVisitedFields.current[visitedField]), JSON.stringify(refVisitedFields.current)]);
        if (typeof value === "boolean")
            refVisitedFields.current[visitedField] = value;
        else {
            refVisitedFields.current[visitedField] = mergeDeep(refVisitedFields.current[visitedField] ?? {}, value);
        }
        setVisitedFields({ ...refVisitedFields.current });
        setParentVisitedFields(id, refVisitedFields.current);
    }, [id]);

 

    const allvisitedFields = useMemo(() => Object.assign({}, rootVisitedFields[id] ?? {}, visitedFields), [rootVisitedFields[id], visitedFields]);

    useEffect(() => {
        console.log("visitedFields updated: " + id, [allvisitedFields]);
    }, [allvisitedFields]);

    return (<VisitedContext.Provider value={{
        visitedFields: allvisitedFields,
        setVisitedFields: updateVisitedFields
    }}>
        {children}
    </VisitedContext.Provider>)
}

function clearErrors(errors: any, changes: any) {
    
    if (!changes)
        return;
    if (!errors)
        return;

    for (let [k, v] of Object.entries(changes)) {
        if (Array.isArray(v)) {

            if (!Array.isArray(errors[k])) {
                errors[k] = [];
            }

            if (errors[k]) {
                for (let [idx, av] of Object.entries(v)) {
                    clearErrors(errors[k][idx], av);
                }
            }
         
        }else if (typeof v === "object") {
            if (isEAVFWError(errors[k]))
                delete errors[k];
            else
                clearErrors(errors[k], v);
        } else {
            delete errors[k];
        }
    }
}

export const EAVForm = <T extends {}, TState extends EAVFormContextState<T>>({ stripForValidation=(a)=>a,formDefinition, defaultData, onChange, children, onValidationResult, state: initialState  }: PropsWithChildren<EAVFormProps<T, TState>>) => {

    const { current: state } = useRef({
        formValues: cloneDeep(defaultData) ?? {},
        formDefinition,
        errors: {},
        fieldMetadata: {},
        isErrorsUpdated:false,
        ... (initialState ?? {})
    } as TState);

    const formId = useUuid();

   
   
    const global_etag = useRef<string>(new Date().toISOString());

   // const [_errors, setLocalErrors] = useState<JsonSchemaError>();
    const [etag, setEtag] = useState(new Date().toISOString());
    
   // const { setFormValues } = useExpressionParserContext();

    const runValidation = (complete?:()=>void) => {
        if (namespace && validationFunction) {
         //   alert("Starting validation");
            // setLocalErrors(undefined);
            const local = global_etag.current = new Date().toISOString();
            const formValuesForValidation = stripForValidation(state.formValues);
            const id = uuidv4();
            console.log("Run Validation", [id,local, global_etag.current, state, formValuesForValidation]);

            setTimeout(() => {
                DotNet.invokeMethodAsync<{ errors: EAVFWErrorDefinition }>(namespace, validationFunction, formDefinition, formValuesForValidation, true)
                    .then(({ errors: results }) => {

                        console.log("Run Validation RESULT", [id, results, local, global_etag.current, JSON.stringify(formValuesForValidation)]);



                        if (local === global_etag.current) {
                            // mergeDeep(data, updatedFields);
                            console.log("Update State", JSON.stringify(formValuesForValidation));
                          //  mergeAndUpdate(state.formValues, updatedFields);
                            console.log("Update State Complete", JSON.stringify(formValuesForValidation))
                            state.errors = results;
                            state.isErrorsUpdated = true;


                            if (onValidationResult)
                                onValidationResult({ errors: results, actions: actions.current, state: state });
                        }


                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        console.log("Validation Complated in " + (new Date().getTime() - new Date(local).getTime()), [id]);
                        // alert("Validation Complated in " + (new Date().getTime() - new Date(local).getTime()));
                        if (local === global_etag.current) {

                            if (onChange)
                                onChange(cloneDeep(state.formValues));

                            setEtag(global_etag.current);

                            if (complete)
                                complete();

                            console.log("Completed update", [id, global_etag.current, JSON.stringify(state.formValues)]);

                        } else {
                            console.log("Running validation again", [id, global_etag.current, JSON.stringify(state.formValues)]);
                           // runValidation(complete); //Run again, state was changed;
                        }



                    });
            });

            return true;

        }
        return false;
    }

    const actions = useRef<EAVFormContextActions<T>>({
        runValidation: runValidation,
        updateState: (cb: (props: any, ctx:any) => void) => {
            console.groupCollapsed("EAVFW : UpdateState");
            try {
                console.time("Callings Calback");
                const updatedProps = cloneDeep(state);
                const ctx = { replaceState:false};
                cb(updatedProps,ctx);
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
                    if (ctx.replaceState) {
                        for (let [k, v] of Object.entries(updatedProps)) {
                            state[k as keyof typeof state] = v;
                        }
                    } else {
                        mergeAndUpdate(state, changedValues);
                    }

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

            const changed = !isEqual(state.formValues, updatedProps);

            const a = deepDiffMapper.map(state.formValues, updatedProps);
            const [_, changedValues] = cleanDiff(a);

            console.log("Updated Props", [updatedProps, changedValues, state, changed, ctx]);
             

            if (changed) {

                const local = global_etag.current = new Date().toISOString();
                state.formValues = updatedProps;
               // mergeAndUpdate(state.formValues=cloneDeep(state.formValues), changedValues);
                console.log("Updated Props", [changed, changedValues, JSON.stringify(state.formValues, null, 4), state]);
              //  state.errors = {}; //TODO, only clear errors on fields that updated;
              //  console.log("Clearing Errors from changed Values", [changedValues,state.errors]);
                clearErrors(state.errors, changedValues);
                console.log("Cleared Errors from changed Values", [state.errors]);


                if (namespace && validationFunction) {
                    let t = new Date().getTime();
                    state.isErrorsUpdated = false;
                    setTimeout(() => {
                        
                        DotNet.invokeMethodAsync<{ errors: EAVFWErrorDefinition, updatedFields: any }>(namespace, "UpdateFormData", formId,local,stripForValidation(state.formValues))
                            .finally(() => {
                                console.log("UpdateFormData in " + (new Date().getTime() - t) + " milisecond");
                            })
                    });
                }

                if (true || ctx.skipValidation || !runValidation()) {
                  
                   
                    setEtag(local);

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

        callbacks[formId] = (etag: string,  errors: EAVFWErrorDefinition) => {

            if (etag === global_etag.current) {

                console.log("Run Validation Result", [errors]);
               // mergeAndUpdate(state.formValues, calculated);
                state.errors = errors;
                state.isErrorsUpdated = true;
                if (onValidationResult)
                    onValidationResult({ errors: errors, actions: actions.current, state: state });

               // if (onChange)
               //     onChange(cloneDeep(state.formValues));

                setEtag(global_etag.current=new Date().toISOString());
            }
        }
        return () => { delete callbacks[formId] };
    }, []);

    useEffect(() => {
        const equal = isEqual(state.formValues, defaultData);
        console.log("EAVForm Default Data Reset", [state.formValues, defaultData, equal]);
        if (!equal) {
            state.formValues = cloneDeep(defaultData) ?? {};
            setEtag(global_etag.current = new Date().toISOString());
        }


    }, [defaultData]);
 

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