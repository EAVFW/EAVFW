import { EAVFormContextState } from "./EAVFormContextState";


export type EAVFormContextActions<T> = {
    runValidation: (onComplete?:()=>void) => void;
    updateState: <TState extends EAVFormContextState<T>>(cb: (state: TState) => void) => void;
    onChange: (cb: (props: T) => void) => void;
    addVisited: (id: string) => void;
}