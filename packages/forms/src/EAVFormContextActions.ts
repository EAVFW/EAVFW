import { Dispatch, SetStateAction } from "react";
import { EAVFWErrorDefinition } from "@eavfw/manifest";
import { EAVFormContextState } from "./EAVFormContextState";


export type EAVFormOnChangeCallbackContext = { skipValidation?: boolean, onCommit?: Function, autoSave?: boolean }
export type EAVFormOnChangeCallback<T> = (props: T, ctx: EAVFormOnChangeCallbackContext) => void
export type EAVFOrmOnChangeHandler<T> = (cb: EAVFormOnChangeCallback<T>) => void
export type EAVCollectContext<TValues, TState extends EAVFormContextState<TValues>, TCollected> = [TCollected, EAVFormContextActions<TValues, TState>, string];

export type EAVFormCollectorRegistrationHandler<TValues, TState extends EAVFormContextState<TValues>> = <TCollected>
    (collector: (state: TState) => TCollected) => EAVCollectContext<TValues, TState, TCollected>;

export type EAVFormCollectorRegistration = {
    oldValue: any;
    trigger: any;
    
}
export type EAVFormContextActions<T, TState extends EAVFormContextState<T>> = {
    runValidation: (onComplete?: () => void, manipulateResult?: (errors: EAVFWErrorDefinition) => EAVFWErrorDefinition) => void;
    updateState: <TState extends EAVFormContextState<T>>(cb: (state: TState, ctx: { replaceState: boolean }) => void) => { changedProp: boolean, changedValues: any } | undefined | void;
    onChange: EAVFOrmOnChangeHandler<T>;
    addVisited: (id: string) => void;

    /**
     * The usecollector is bound to the current EAVForm Context 
     * and works such its only updated if the collected data 
     * has changed upon updates.
     * 
     * */
    useCollector:EAVFormCollectorRegistrationHandler<T,TState>
;
}