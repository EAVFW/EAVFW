
import { EntityDefinition } from "@eavfw/manifest";
import { FormsConfig } from "../../FormsConfig";
import { OptionsFactory } from "./AutoForm/OptionsFactory";
import { FormValidation } from "./FormValidation";


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