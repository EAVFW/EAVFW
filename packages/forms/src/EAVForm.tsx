
import { EAVFWErrorDefinition, EAVFWErrorDefinitionMap, isEAVFWError, ManifestDefinition, ValidationDefinitionV1, ValidationDefinitionV2, } from "@eavfw/manifest";
import { useExpressionParserContext } from "@eavfw/expressions";
import { createContext, MutableRefObject, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { EAVFormContext } from "./EAVFormContext";

import cloneDeep from "clone-deep";

import { cleanDiff, deepDiffMapper, mergeDeep } from "@eavfw/utils";
import { EAVFormContextState } from "./EAVFormContextState";
import { EAVCollectContext, EAVFormCollectorRegistration, EAVFormContextActions, EAVFormOnChangeCallbackContext } from "./EAVFormContextActions";

import { useBlazor, useUuid } from "@eavfw/hooks";
import { useEAVForm } from "./useEAVForm";
import { useAppInfo, useFormChangeHandler, useModelDrivenApp, WarningContextProvider  } from "@eavfw/apps";
import { DirtyContainer } from "./DirtyContext";

export type EAVFormProps<T extends {}, TState extends EAVFormContextState<T>> = {
    purpose?:string,
    formDefinition?: ManifestDefinition,
    defaultData?: T
    initialErrors?: EAVFWErrorDefinitionMap,
    initialVisitedFields?: VisitedFieldElement,
    onChange?: (data: T, ctx?: any) => void;
    state?: Omit<TState, keyof EAVFormContextState<T>>;
    onValidationResult?: (result: { errors: EAVFWErrorDefinition, actions: EAVFormContextActions<T,TState>, state: TState }) => void;
    stripForValidation?:(data:T)=>T
}


//const namespace = process.env['NEXT_PUBLIC_BLAZOR_NAMESPACE'];
//const validationFunction = process.env['NEXT_PUBLIC_BLAZOR_EVAL_VALIDATION'];




declare global {
    interface Window { formValuesUpdate: any;  }
}


const callbacks: { [key: string]: Function } = {

}

if (typeof global.window !== "undefined") {
    window['formValuesUpdate'] = function (id: string, etag: string, validations: any, log?: string) {
        console.log('Run Validation Result Raw', arguments);

        if (id in callbacks) {
            callbacks[id](etag, validations,log);
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
function mergeAndUpdate<T extends object>(data: any, updatedFields: T) : T {
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

export type SetVisitedFieldsFunction = (visitedField: string, value: VisitedFieldElementValue) => void;
export type VisitedContextType = { visitedFields: VisitedFieldElement, setVisitedFields: SetVisitedFieldsFunction }
const VisitedContext = createContext<VisitedContextType>({
    visitedFields: {} as VisitedFieldElement,
    setVisitedFields: (visitedField: string, value: VisitedFieldElementValue) => { console.log("visited container updated", [visitedField, value])  }
});

export const useVisitedContext = () => useContext(VisitedContext);



export const VisitedContainer: React.FC<{ id: string, initialdata?: VisitedFieldElement }> = ({ id, children, initialdata = {} }) => {

    const { setVisitedFields: setParentVisitedFields, visitedFields: rootVisitedFields } = useVisitedContext();
    const refVisitedFields = useRef<VisitedFieldElement>(initialdata);
    const [visitedFields, setVisitedFields] = useState<VisitedFieldElement>(refVisitedFields.current);
    const updateVisitedFields = useCallback((visitedField: string, value: VisitedFieldElementValue = true) => {
        console.log("Setting visible field " + visitedField, [JSON.stringify(value),
            JSON.stringify(refVisitedFields.current[visitedField]), JSON.stringify(refVisitedFields.current),
            typeof value === "boolean"?value: mergeDeep(refVisitedFields.current[visitedField] ?? {}, value)
        ]);
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

function clearErrorsFromDiff(errors: any, diffs: any) {
    if (!errors)
        return;

    for (let [k, v] of Object.entries<any>(diffs)) {
        if (typeof v === "object" && v) {
            if ("__type" in v) {
                if (v["__type"] !== "unchanged") {
                    delete errors[k];
                }
            } else {
                
                    clearErrorsFromDiff(errors[k], v);
                
            }
        }
    }
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

type validationRulesType = {
    field: string,
    rules: { [validationKey: string]: ValidationDefinitionV1 | ValidationDefinitionV2 }
}

type validationResponse = {
    field: string,
    validationKey:string,
    message?: string,
    messageCode?: string,
    type: "info" | "warning" | "error"
}
export const EAVFormValidation: React.FC<{ initialVisitedFields?: VisitedFieldElement }> = ({ children, initialVisitedFields }) => {

    const app = useModelDrivenApp();
    const appInfo = useAppInfo();
    const [warnings, setWarnings] = useState<Array<{ logicalName: string, warning: string }>>([]);
    const attributes = useMemo(() => appInfo.currentEntityName ? app.getAttributes(appInfo.currentEntityName) : {}, [appInfo.currentEntityName]);
    const blazor = useBlazor();
    const validationRules = useMemo(()=> Object.entries(attributes).filter(([key, attr]) => attr.validation).map(([key, attr]) => {
        return {
            field: key,
            rules: { ...attr.validation }
        } as validationRulesType
    }), [attributes]);

    /**
         * Get updates when formvalue changes
         * */

    const [{ localFromValues }] = useEAVForm(state => {
        return {
            localFromValues: state.formValues,
        };
    },100);


    /**
     * Set up initial validation rules and recreate when current entity/app/area has changed
     */
    if (blazor.isEnabled && blazor.addValidationRulesFunction) {

        useEffect(() => {
            console.log("Extracted Validation rules", [validationRules.map(c => c.field), validationRules, localFromValues])
            setTimeout(() => {
                if (blazor.addValidationRulesFunction) { 
                DotNet.invokeMethodAsync(blazor.namespace, blazor.addValidationRulesFunction, validationRules)
                    .then(_ => console.log("Validation Rules Added"))
                    .catch(err => console.error("Error when loading validation rules", [err]));
                }
            });
        }, [validationRules]);
    }

    const currentTime = useRef(new Date().getTime());
    /**
     * Whever the data on form changes, send formdata to reevaluate validations
     */
    useEffect(() => {
        let startTime = new Date().getTime();
        console.log("Data changed, validating rules:");
        console.log("localFromValues", localFromValues);

        const start = currentTime.current = new Date().getTime();

        if (blazor.isEnabled) {
            setTimeout(() => {
                if (blazor.validateValidationRulesFunction) {
                    DotNet.invokeMethodAsync(blazor.namespace, blazor.validateValidationRulesFunction, localFromValues)
                        .then(res => {

                            if (start !== currentTime.current) {
                                return;
                            }

                            console.log(`Data changed, validating rules ran in ${new Date().getTime() - startTime}:`, res);
                            const validationResponses = res as validationResponse[];

                            for (let validationResponse of validationResponses) {
                                if (validationResponse.messageCode) {
                                    validationResponse.message = app.getLocaleErrorMessage(validationResponse.messageCode, app.locale);
                                }

                                if (validationResponse.type === "error") {
                                    console.error("Validation error: ", [validationResponse.field, validationResponse.validationKey, validationResponse.message])
                                } else if (validationResponse.type === "warning") {
                                    console.warn("Validation warning: ", [validationResponse.field, validationResponse.validationKey, validationResponse.message])
                                }
                            }

                            const warnings = validationResponses.filter(x => x.type === "warning").map(w => ({ logicalName: attributes[w.field].logicalName, warning: w.message! }));
                            console.log("setting warnings: ", warnings);
                            setWarnings(warnings);


                        })
                        .catch(err => console.error("Error occured in validation:", [err]));
                }
            });
        }
    }, [localFromValues]);

    return (
        <VisitedContainer id="root" initialdata={initialVisitedFields}>
            <DirtyContainer id="root">
                <WarningContextProvider value={warnings}>
                    {children}
                </WarningContextProvider>
            </DirtyContainer>
        </VisitedContainer>
    )
}
function mergeErrors(err1: EAVFWErrorDefinitionMap, err2: EAVFWErrorDefinitionMap): EAVFWErrorDefinitionMap {
    if (!err2)
        return err1;

    for (let [k, e] of Object.entries(err2)) {
        if (Array.isArray(e) ) {
            err1[k] = e.map((ee, ii) => {

                if (isEAVFWError(ee)) {
                    return ee;
                } else {
                    let left = err1[k] as EAVFWErrorDefinitionMap[];
                    return mergeErrors(left?.[ii] ?? {}, ee);
                }
            });
            
        } else if (isEAVFWError(e)) {
            err1[k] = e;
        } else {
            err1[k] = mergeErrors(err1[k] as EAVFWErrorDefinitionMap ?? {} , e);
        }
    }

    return err1;
}

export const EAVForm = <T extends {}, TState extends EAVFormContextState<T>>({
    stripForValidation = (a) => a,
    purpose,
    formDefinition,
    defaultData,
    onChange,
    initialErrors,
    initialVisitedFields,
    children,
    onValidationResult,
    state: initialState }: PropsWithChildren<EAVFormProps<T, TState>>) => {

    const { current: state } = useRef({
        formValues: cloneDeep(defaultData) ?? {},
        formDefinition,
        errors: initialErrors??{},
        fieldMetadata: {},
        isErrorsUpdated: typeof (initialErrors) !== "undefined",
        ... (initialState ?? {})
    } as TState);

    const formId = useUuid(); 
   
    console.log("EAVForm: ID", [formId, (defaultData as any)?.name, (state?.formValues as any)?.name, initialErrors, state?.formValues, defaultData]);
    const blazor = useBlazor();
   
    const global_etag = useRef<string>(new Date().toISOString());
    const [etag, setEtag] = useState(new Date().toISOString());
    
    useEffect(() => {
        console.log("eavform change", defaultData);
        /*
         * If <EAVForm defaultData={defaultData} , onChange={setDefaultData} /> iused to control state outside eavform for data object,
         * then the internal etag should only change when its a new object. 
         * 
         * The formvalues are cloned internal to ensure that local changes is not reflected in outside object before onChange is called again.
         */
        if (defaultData && state.formValues !== defaultData) {
            state.formValues = cloneDeep(defaultData);
            setEtag(global_etag.current = new Date().toISOString());
        }
    }, [defaultData])
    
    useEffect(() => {
        if (blazor.isEnabled ) {
            let t = new Date().getTime();
             
            setTimeout(() => {
                if (blazor.updateFormDataFunction) {
                    DotNet.invokeMethodAsync<{ errors: EAVFWErrorDefinition, updatedFields: any }>(
                        blazor.namespace, blazor.updateFormDataFunction,
                        formId,
                        etag,
                        stripForValidation(state.formValues),
                        typeof (initialErrors) === "undefined", //runvalidation
                        true, //runExpressions
                        true) //includeLogs
                        .finally(() => {
                            console.log("UpdateFormData in " + (new Date().getTime() - t) + " milisecond");
                        })
                }
            });
        }
    },[]);

    const runValidation = (complete?: () => void) => {
        
        if (blazor.isEnabled) {
            //   alert("Starting validation");
            // setLocalErrors(undefined);
            const local = global_etag.current = new Date().toISOString();
            const formValuesForValidation = stripForValidation(state.formValues);
            const id = uuidv4();
            console.log("Run Validation", [id, local, global_etag.current, state, formValuesForValidation]);

            setTimeout(() => {
                if (blazor.validateFormFunction) {
                    DotNet.invokeMethodAsync<{ errors: EAVFWErrorDefinition }>(blazor.namespace, blazor.validateFormFunction, formDefinition, formValuesForValidation, true)
                        .then(({ errors: results }) => {

                            console.log("Run Validation RESULT", [new Date().getTime() - new Date(local).getTime() + "ms", id, results, local, global_etag.current, JSON.stringify(formValuesForValidation)]);

                            

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
                }
            });
        
            return true;

        }
        return false;
    }

    const collectors = useRef<{ [key: string]: EAVFormCollectorRegistration }>({});

    const actions: MutableRefObject<EAVFormContextActions<T, TState>> = useRef({
        useCollector: (collector) => {
             
            const [collected, setCollected] = useState<EAVCollectContext<T, TState, any>>([collector(state), actions.current, etag]);

            useEffect(() => {

                let id = uuidv4();
                console.log("Registered Collector:", [id]);

                collectors.current[id] = {
                    oldValue: collected[0],
                    trigger: (localstate: TState, etag: string) => {


                        let newValue = collector(localstate);
                        if (!isEqual(collectors.current[id].oldValue, newValue)) {
                            collectors.current[id].oldValue = cloneDeep(newValue);
                            setCollected([collector(localstate), actions.current, etag]);
                        }
                    }
                };

                return () => {
                    console.log("unregistered collector:", [id]);

                    delete collectors.current[id];
                }
            }, []);
            return collected;
            
           
        },
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
                    let newetag = new Date().toISOString();
                    for (let collector of Object.values(collectors.current)) {
                        collector.trigger(state, newetag);
                    }
                    setEtag(global_etag.current = newetag);
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

            console.log(`[${new Date().toISOString()}]RUN ACTION OnChange Start`, [new Error()]);
            const updatedProps = cloneDeep(state.formValues);
            const ctx: EAVFormOnChangeCallbackContext = { skipValidation:false };
           
            cb(updatedProps,ctx);

            const changed = !isEqual(state.formValues, updatedProps);

            console.log(`[${new Date().toISOString()}]RUN ACTION OnChange Changed`, [changed,
                JSON.stringify(state.formValues),
                JSON.stringify(updatedProps)]);

            const a = deepDiffMapper.map(state.formValues, updatedProps);
            const [_, changedValues] = cleanDiff(a);
             
            console.log(`[${new Date().toISOString()}]RUN ACTION OnChange Updated Props`, [updatedProps, changedValues, state, changed, ctx, a]);

            if (changed) {

                const local = global_etag.current = new Date().toISOString();
                state.formValues = updatedProps;
              
                console.log("Updated Props", [changed, changedValues, JSON.stringify(state.formValues, null, 4), state]);
               
                let cloneerrors = cloneDeep(state.errors);
                clearErrorsFromDiff(state.errors, a);
               
                console.log(`Run Validation: Cleared Errors from changed Values[\n${JSON.stringify(cloneerrors)},\n${JSON.stringify(changedValues)},\n${JSON.stringify(state.errors) }]`);


                if (blazor.isEnabled) {
                    let t = new Date().getTime();
                    state.isErrorsUpdated = false;
                    setTimeout(() => {
                        if (blazor.updateFormDataFunction && local === global_etag.current) {
                            console.log(`[${new Date().toISOString()}]RUN ACTION Invoking ${blazor.updateFormDataFunction}`, [local , global_etag.current,changed]);
                            DotNet.invokeMethodAsync<{ errors: EAVFWErrorDefinition, updatedFields: any }>(
                                blazor.namespace, blazor.updateFormDataFunction,
                                formId,
                                local,
                                stripForValidation(state.formValues), true,true, true)
                                .finally(() => {
                                    console.log("UpdateFormData in " + (new Date().getTime() - t) + " milisecond");

                                })
                        }
                    });
                }

                 
                for (let collector of Object.values(collectors.current)) {
                    collector.trigger(state, local);
                }
                setEtag(local);

                if (onChange)
                    onChange(state.formValues,ctx);

                console.log("Updated Props Changed", [changed, state.formValues]);
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

    } as EAVFormContextActions<T, TState>);

    useEffect(() => {

        callbacks[formId] = (etag: string,  errors: EAVFWErrorDefinition,log?:string) => {

            if (etag === global_etag.current) {

                const clone = cloneDeep(state.errors);
               // mergeAndUpdate(state.formValues, calculated);
                var test = mergeErrors(state.errors as EAVFWErrorDefinitionMap, errors as EAVFWErrorDefinitionMap);
             

                console.log("Run Validation Result", [(new Date().getTime() - new Date(etag).getTime()) + "ms"]);
                console.log("Run Validation Result: \n" + log);
                console.log("Run Validation Result: \n" + JSON.stringify([clone, errors, state.errors]));

                 

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

    //useEffect(() => {
    //    const equal = isEqual(state.formValues, defaultData);
    //    console.log("EAVForm Default Data Reset", [JSON.stringify(state.formValues), JSON.stringify( defaultData), equal]);
    //    if (defaultData && !equal) {
    //        state.formValues = cloneDeep(defaultData) ?? {};
    //        setEtag(global_etag.current = new Date().toISOString());
    //    }


    //}, [defaultData]);

   

    return (
        <EAVFormContext.Provider
            value={{         
                purpose: purpose??"default",
                actions: actions.current,
                state: state,           
                etag,           
            }}>
            <EAVFormValidation initialVisitedFields={initialVisitedFields}>
                {children}           
            </EAVFormValidation>
        </EAVFormContext.Provider>
    )
}