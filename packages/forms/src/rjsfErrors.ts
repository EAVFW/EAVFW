
import { EAVFWErrorDefinition, isEAVFWError, ManifestDefinition, } from "@eavfw/manifest";

export type JsonSchemaErrorObject = {
    __errors: Array<string>;
}
export type JsonSchemaErrorObjectWrap = {
    [key: string]: JsonSchemaError
}
export type JsonSchemaError = JsonSchemaErrorObjectWrap | JsonSchemaErrorObject | Array<JsonSchemaErrorObjectWrap | JsonSchemaErrorObject>;


export const rjsfErrors: (arg: EAVFWErrorDefinition) => JsonSchemaError =
    (errors) => {

        if (Array.isArray(errors)) {
            return errors.map((e, i) => rjsfErrors(e)) as Array<JsonSchemaErrorObjectWrap | JsonSchemaErrorObject>;
        }

        if (isEAVFWError(errors)) {
            return { __errors: [errors.error] } as JsonSchemaErrorObject;
        }

        return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, rjsfErrors(v)])) as JsonSchemaErrorObjectWrap;

    }
