import { EAVFWErrorDefinition, ManifestDefinition } from "@eavfw/manifest";
import { EAVFormContextActions } from "./EAVFormContextActions";
import { EAVFormContextState } from "./EAVFormContextState";


export type EAVFormContextProps<TFormValues, TState extends EAVFormContextState<TFormValues>> = {
    purpose: string;    
    actions: EAVFormContextActions<TFormValues, TState>;
    state: TState;
    etag: string;
}