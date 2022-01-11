import { EAVFWErrorDefinition, ManifestDefinition } from "@eavfw/manifest";


export type EAVFormContextState<T> = {
    formValues: T;
    formDefinition?: ManifestDefinition;
    fieldMetadata: any;
    errors: EAVFWErrorDefinition;
}