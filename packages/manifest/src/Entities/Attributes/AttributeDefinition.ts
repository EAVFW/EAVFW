import { LocaleDefinition } from "../../Localization";
import { ValidationDefinition } from "../../Validation";
import { AttributeTypeDefinition } from "./Types/AttributeTypeDefinition";

export type AttributeDefinition = {
    isPrimaryField?: boolean;
    isPrimaryKey?: boolean;
    locale?: { [locale: string]: Omit<LocaleDefinition, "pluralName"> };
    displayName: string;
    schemaName: string;
    logicalName: string;
    type: AttributeTypeDefinition;
    description?: string;
    default?: string | number | boolean;
    readonly?: boolean;
    validation?: { [validationKey: string]: ValidationDefinition }
    [x: string]: any
};