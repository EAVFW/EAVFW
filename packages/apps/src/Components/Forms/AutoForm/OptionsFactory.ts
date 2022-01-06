import { JSONSchema7 } from "json-schema";
import { UiSchema } from "@rjsf/core";

export type OptionsFactory = (property: string, x: JSONSchema7) => UiSchema["ui:options"];
