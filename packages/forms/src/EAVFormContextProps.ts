import { EAVFWErrorDefinition, ManifestDefinition } from "@eavfw/manifest";
import { EAVFormContextActions } from "./EAVFormContextActions";
import { EAVFormContextState } from "./EAVFormContextState";


export type EAVFormContextProps<T> = {
    actions: EAVFormContextActions<T>;
    state: EAVFormContextState<T>;
    etag: string;
}