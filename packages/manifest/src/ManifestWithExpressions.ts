import { ManifestDefinition } from "./ManifestDefinition";

type TypeOrString<T> = {
    [P in keyof T]: T[P] | TypeOrString<T[P]> | string;
};
//export type Manifest = ManifestDefinition;
export type ManifestWithExpressions = TypeOrString<ManifestDefinition>;
