import { EntityDefinition, FormDefinition } from "@eavfw/manifest";
import { FormValidation } from "../../FormValidation";
import { OptionsFactory } from "../OptionsFactory";


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