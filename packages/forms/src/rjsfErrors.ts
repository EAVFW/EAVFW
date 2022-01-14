
import { EAVFWError, EAVFWErrorDefinition, isEAVFWError, ManifestDefinition, } from "@eavfw/manifest";

export type JsonSchemaErrorObject = {
    __errors: Array<string>;
}
export type JsonSchemaErrorObjectWrap = {
    [key: string]: JsonSchemaError
}
export type JsonSchemaError = JsonSchemaErrorObjectWrap | JsonSchemaErrorObject | Array<JsonSchemaErrorObjectWrap | JsonSchemaErrorObject>;


export const rjsfErrors: (arg: EAVFWErrorDefinition, state?: any, fx?: (n: EAVFWError, state:any) => JsonSchemaErrorObject) => JsonSchemaError =
    (errors, state = {}, fx) => {

        if (typeof errors === "undefined")
            return {} as JsonSchemaErrorObjectWrap;

        if (Array.isArray(errors)) {
            console.debug("rjsfErrors array", [errors, state])
            return errors.map((e, i) => rjsfErrors(e,state?.[i],fx)) as Array<JsonSchemaErrorObjectWrap | JsonSchemaErrorObject>;
        }

        if (isEAVFWError(errors)) {
            console.debug("rjsfErrors error", [errors, state, fx])
            if (fx)
                return fx(errors,state) as JsonSchemaErrorObject;
            return { __errors: [errors.error] } as JsonSchemaErrorObject;
        }

        console.debug("rjsfErrors object", [errors, state])
        const entries = Object.entries(errors).map(([k, v]) => [k, rjsfErrors(v, state[k], fx)]);
        
        return Object.fromEntries(entries) as JsonSchemaErrorObjectWrap;

    }