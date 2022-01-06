
import { JSONSchema7 } from "json-schema";

export type ControlJsonSchemaObject = {
    properties: { [key: string]: ControlJsonSchema };
} & Omit<JSONSchema7, "properties">;

export type ControlJsonSchema = JSONSchema7 & {
    "x-widget"?: string;
    "x-field"?: string;
    "x-widget-props"?: any;
    "x-control"?: string;
    "x-description"?: string;
    "x-logicalname"?: string;
    "enumNames"?: string[]
};