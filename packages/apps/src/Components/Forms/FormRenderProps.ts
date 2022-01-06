import { NestedType } from "@eavfw/manifest";
import { FormValidation } from "@rjsf/core";


export type FormRenderProps = {
    stickyFooter?: boolean,
    record?: any,
    type?: NestedType,
    forms?: string[],
    formName?: string;
    dismissPanel: (ev: "save" | "cancel") => void,
    onChange: (data: any) => void
    entityName?: string;
    extraErrors?: FormValidation;
}