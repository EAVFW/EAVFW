
import { FieldValidation } from "@rjsf/core";


export type FormValidation = Partial<Omit<FieldValidation, "addError">> & {
    [fieldName: string]: Omit<FieldValidation, "addError">;
};