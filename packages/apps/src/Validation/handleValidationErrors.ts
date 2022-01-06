import { ModelDrivenApp } from "../ModelDrivenApp";
import { FormValidation, FieldValidation } from "@rjsf/core";
import { ValidationError } from "./ValidationError";
import { stringFormat } from "@eavfw/utils";
import { isLookup } from "@eavfw/manifest";

export async function handleValidationErrors(rsp: Response, app: ModelDrivenApp) {
    console.log("An error occured");
    let errors = [];
    let extraErrors = {} as FormValidation;


    if (rsp.status === 409) {
        let responseJson = (await rsp.json()).errors as ValidationError[];
        console.log(responseJson);


        for (let x of responseJson) {
            let localizedError = x.Error;
            let ll = app.getLocaleErrorMessage(x.Code)
            if (ll !== undefined) {
                localizedError = stringFormat(ll, x.ErrorArgs);
            }
            const entity = app.getEntityFromCollectionSchemaName(x.EntityCollectionSchemaName);
            const attributes = app.getAttributes(entity.logicalName.toLowerCase());
            const attribute = Object.values(attributes).filter(a => a.logicalName === x.AttributeSchemaName || (isLookup(a.type) && (a.logicalName + "id") === x.AttributeSchemaName))[0];
            const name = attribute?.locale?.[app.locale]?.displayName ?? attribute?.displayName;

            if (name) {
                if (extraErrors[name] === undefined) {
                    extraErrors[name] = { __errors: [localizedError] } as FieldValidation
                } else {
                    extraErrors[name].__errors.push(localizedError)
                }
            } else {
                errors.push(localizedError);
            }
        }


    }

    return { errors, extraErrors };
}