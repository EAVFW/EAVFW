import { EntityDefinition, FormDefinition } from "@eavfw/manifest";
import { OptionsFactory } from "../OptionsFactory";
import { FormValidation } from "@rjsf/core";

export type SectionComponentProps<T> = {
    form: FormDefinition;
    entityName: string;
    tabName: string;
    columnName: string;
    sectionName: string;
    entity: EntityDefinition;
    formName: string;
    locale: string;
    formData: T;
    onFormDataChange?: (formdata: T) => void;
    factory?: OptionsFactory;
    formContext?: any;
    extraErrors?: FormValidation;
};