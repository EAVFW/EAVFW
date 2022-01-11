import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { EAVFormContext } from "./EAVFormContext";
import { EAVFormContextActions } from "./EAVFormContextActions";
import { EAVFormContextProps } from "./EAVFormContextProps";
import cloneDeep from "clone-deep";
import { EAVFormContextState } from "./EAVFormContextState";



//export const showErrors: (arg: JsonSchemaError, prefix: string, visited: (n: string) => boolean) => JsonSchemaErrorObjectWrap =
//    (errors, prefix, visited) => {

//        console.log("showError", errors);
//        if (!errors)
//            return;

//        if (isSchemaError(errors)) {
//            return visited(prefix) ? errors : null;
//        }


//        if (Array.isArray(errors)) {
//            return errors.map((e, i) => showErrors(e, prefix ? prefix + "_" + i : i.toString(), visited)).filter((k) => !!k);
//        }


//        return Object.fromEntries(
//            Object.entries(errors).map(([k, v]) => [k, showErrors(v, prefix ? prefix + "_" + k : k, visited)])
//                .filter(([k, v]) => !!v));


//    }



//export const createExtraErrors = (errors: ValidationError[]) => {





//    console.groupCollapsed("createExtraErrors");
//    console.log(errors);
//    console.log(typeof errors);
//    console.log(Array.isArray(errors));
//    try {
//        let extraErrors: ExtraError | any = {};
//        errors.forEach((err: any) => {
//            console.log("Finding Errors", err);

//            const idArr = err.entityCollectionSchemaName.split('__');
//            const tabId = err["x-tabid"] ?? (idArr.length >= 2 ? idArr[0] : "");
//            const nodeId = err["x-validation-node"] ?? (idArr.length >= 2 ? idArr[1] : "");
//            const fieldId = idArr.length >= 3 ? idArr[2] : "";
//            console.log("FIELDID", fieldId);
//            console.log({ idArr, tabId, nodeId, fieldId, })
//            if (tabId) {
//                if (!extraErrors[tabId]) {
//                    extraErrors[tabId] = {}
//                }
//                if (!fieldId) {
//                    if (extraErrors[tabId].__errors) {
//                        extraErrors[tabId].__errors.push(`${nodeId}__${err.error}`);
//                    } else {

//                        extraErrors[tabId] = { ...extraErrors[tabId], __errors: [`${nodeId}__${err.error}`] }
//                    }
//                } else {
//                    if (!extraErrors[tabId][nodeId]) {
//                        extraErrors[tabId][nodeId] = {}
//                    }
//                    if (extraErrors[tabId][nodeId].__errors) {
//                        extraErrors[tabId][nodeId].__errors.push(`${fieldId}__${err.error}`);

//                    } else {
//                        extraErrors[tabId][nodeId] = { ...extraErrors[tabId][nodeId], __errors: [`${fieldId}__${err.error}`] }
//                    }
//                }
//            }
//        });
//        console.log(extraErrors);
//        return extraErrors;
//    } finally {
//        console.groupEnd();
//    }
//}

export function useEAVForm<TCollected, TFormValues = any>(collector: (state: EAVFormContextState<TFormValues>) => TCollected, logid?: string): [TCollected, EAVFormContextActions<TFormValues>]
export function useEAVForm<TFormValues, TCollected>(collector: (state: EAVFormContextState<TFormValues>) => TCollected, logid?: string): [TCollected, EAVFormContextActions<TFormValues>]
export function useEAVForm<TFormValues, TCollected,TState extends EAVFormContextState<TFormValues>>(collector: (state: TState) => TCollected, logid?: string): [TCollected, EAVFormContextActions<TFormValues>]
export function useEAVForm<TFormValues, TCollected,TState extends EAVFormContextState<TFormValues>>(collector: (state: TState) => TCollected, logid?: string): [TCollected, EAVFormContextActions<TFormValues>] {

    const {
        actions,
        state,        
        etag
    } = useContext<EAVFormContextProps<TFormValues>>(EAVFormContext);

    const oldValues = useRef(collector(state as TState));
    const [subscriptionid, setsubscriptionid] = useState(new Date().toISOString());
  
    useEffect(() => {
        console.log("useEAVForm Trigger: " + logid + " " + etag);
        const newValues =  collector(state as TState);
        console.debug("useEAVForm oldValues: " + logid, oldValues.current);
        console.debug("useEAVForm newValues: " + logid, newValues);

        if (!isEqual(oldValues.current, newValues)) {
            console.log("Updating subscription with new values: " + logid);
            oldValues.current = newValues;
            setsubscriptionid(new Date().toISOString());

        }

    }, [etag]);

  
    const collected = useMemo(() => {
        console.log("useEAVForm collected: " + logid, collector(state as TState));

        let collected = collector(state as TState);

        return [
            cloneDeep(collected), actions] as [TCollected, EAVFormContextActions<TFormValues>];
    }, [subscriptionid]);
     
    

    return collected;
}
