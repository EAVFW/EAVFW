
import { EntityDefinition } from "@eavfw/manifest";
import { FormValidation } from "@rjsf/core";
import { FormsConfig } from "../../FormsConfig";
import { OptionsFactory } from "./AutoForm/OptionsFactory";


export type ModelDrivenEntityViewerProps = {
    entity: EntityDefinition;
    locale: string;
    entityName: string;
    formName: string;
    record?: any;
    factory?: OptionsFactory;
    onChange?: (data: any) => void;
    related?: Array<string>;
    extraErrors?: FormValidation;
} & FormsConfig;