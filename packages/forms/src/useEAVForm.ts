import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { EAVFormContext } from "./EAVFormContext";
import { EAVFormContextActions } from "./EAVFormContextActions";
import { EAVFormContextState } from "./EAVFormContextProps";





export function useEAVForm<TFormValues, TCollected>(collector: (state: EAVFormContextState<TFormValues>) => TCollected, logid?: string): [TCollected, EAVFormContextActions<TFormValues>] {

    const {
        actions,
        state,        
        etag
    } = useContext(EAVFormContext);

    const oldValues = useRef(Object.values(collector(state)));
    const [subscriptionid, setsubscriptionid] = useState(new Date().toISOString());
  
    useEffect(() => {
        console.debug("useEAVForm Trigger: " + logid + " " + etag);
        const newValues = Object.values(collector(state));
        console.debug("useEAVForm oldValues: " + logid, oldValues.current);
        console.debug("useEAVForm newValues: " + logid, newValues);

        if (!isEqual(oldValues.current, newValues)) {
            console.log("Updating subscription with new values: " + logid);
            oldValues.current = newValues;
            setsubscriptionid(new Date().toISOString());

        }

    }, [etag]);

  
    const collected = useMemo(() => {
        console.debug("useEAVForm collected: " + logid, collector(state));

        let collected = collector(state);

        return [
            Array.isArray(collected) ?
                collected.slice() :
                { ...collected }, actions] as [TCollected, EAVFormContextActions<TFormValues>];
    }, [subscriptionid]);
     
    

    return collected;
}
