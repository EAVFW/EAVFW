import { EAVFormContextState } from "./EAVFormContextState";


export type EAVFormOnChangeCallbackContext = { skipValidation?: boolean, onCommit?: Function }
export type EAVFormOnChangeCallback<T> = (props: T, ctx: EAVFormOnChangeCallbackContext) => void
export type EAVFOrmOnChangeHandler<T> = (cb: EAVFormOnChangeCallback<T>) => void

export type EAVFormContextActions<T> = {
    runValidation: (onComplete?: () => void) => void;
    updateState: <TState extends EAVFormContextState<T>>(cb: (state: TState, ctx: { replaceState: boolean }) => void) => void;
    onChange: EAVFOrmOnChangeHandler<T>;
    addVisited: (id: string) => void;
}