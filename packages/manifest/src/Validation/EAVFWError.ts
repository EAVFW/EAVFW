
import { EAVFWErrorDefinitionMap } from "./EAVFWErrorDefinitionMap";

export type EAVFWError = {
    error: string;
    code: string;
    visible?: boolean;
    [key: string]: any;
}

export function isEAVFWError(errors: EAVFWError | EAVFWErrorDefinitionMap): errors is EAVFWError {
    return (typeof errors === "object" && "error" in errors && "code" in errors);
}