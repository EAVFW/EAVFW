import { ManifestDefinition } from "../../manifest/src";
import { AppContext } from "./AppContext";
import { ModelDrivenApp } from "./ModelDrivenApp";

function throwIfNull<T>(value: T, error: string) {
    return value ?? (() => { throw new Error(error) })();
}
export interface EAVAppProps {

}
export interface EAVAppModelProps extends EAVAppProps{
    model: ModelDrivenApp
}
export interface EAVAppManifestProps extends EAVAppProps {
    manifest: ManifestDefinition
}
export type Test = EAVAppModelProps | EAVAppManifestProps;
export const EAVApp: React.FC<Test> = ({ children, ...props }) => <AppContext.Provider value={"model" in props ? props.model : new ModelDrivenApp(throwIfNull(props.manifest,"Manifest or model must be given"))}>{children}</AppContext.Provider>