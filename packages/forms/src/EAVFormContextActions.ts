import { EAVFWErrorDefinition } from "@eavfw/manifest";
import { EAVFormContextState } from "./EAVFormContextState";


export type EAVFormOnChangeCallbackContext = { skipValidation?: boolean, onCommit?: Function, autoSave?: boolean }
export type EAVFormOnChangeCallback<T> = (props: T, ctx: EAVFormOnChangeCallbackContext) => void
export type EAVFOrmOnChangeHandler<T> = (cb: EAVFormOnChangeCallback<T>) => void

export type EAVFormContextActions<T> = {    
    runValidation: (complete?: () => void, manipulateResult?: (errors: EAVFWErrorDefinition) => EAVFWErrorDefinition) => void;
    updateState: <TState extends EAVFormContextState<T>>(cb: (state: TState, ctx: { replaceState: boolean }) => void) => {changedProp: boolean, changedValues: any } | undefined | void;
    onChange: EAVFOrmOnChangeHandler<T>;
    addVisited: (id: string) => void;
}