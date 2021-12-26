import { EAVFWErrorDefinition, ManifestDefinition } from "@eavfw/manifest";
import { EAVFormContextActions } from "./EAVFormContextActions";

export type EAVFormContextState<T> = {
    formValues: T;
    formDefinition: ManifestDefinition;
    visited: string[];
    errors: EAVFWErrorDefinition
}
export type EAVFormContextProps<T> = {
    actions: EAVFormContextActions<T>;
    state: EAVFormContextState<T>;
    etag: string;
}