import { FormDefinition, NestedType } from "@eavfw/manifest";
import { FormValidation } from "./FormValidation";




export type FormRenderProps = {
    stickyFooter?: boolean,
    record?: any,
    type?: NestedType,
    forms?: string[],
    formName?: string;
    dismissPanel: (ev: "save" | "cancel") => void,
    onChange: (data: any, ctx?: any) => void
    entityName?: string;
    extraErrors?: FormValidation;
}