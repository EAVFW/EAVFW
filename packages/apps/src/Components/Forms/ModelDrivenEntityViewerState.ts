
import { AttributeDefinition, EntityDefinition, FormDefinition, FormColumnDefinition } from "@eavfw/manifest";
import { FormValidation } from "@rjsf/core";

export type ModelDrivenEntityViewerState = {
    selectedForm: string;
    formData: any;
    saving: boolean;
    formName: string;
    form: FormDefinition;
    entity: EntityDefinition;
    isLoading: boolean;
    evaluatedForm: FormDefinition;
    groups: Array<Array<[string, FormColumnDefinition, AttributeDefinition]>>
    extraErrors?: FormValidation;
};