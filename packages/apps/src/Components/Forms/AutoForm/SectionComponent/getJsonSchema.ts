
import { JSONSchema7 } from "json-schema";
import { AttributeDefinition, ChoiceType, EntityDefinition, FormColumnDefinition, NestedType, StringType } from "@eavfw/manifest";
import { ModelDrivenApp } from "../../../../ModelDrivenApp";
import { ControlJsonSchema } from "../ControlJsonSchema";
import { enumValuesFactory } from "./enumValuesFactory";
import { enumDisplayNameFactory } from "./enumDisplayNameFactory";

export function getJsonSchema(
    attribute: AttributeDefinition,
    field: FormColumnDefinition,
    entity: EntityDefinition,
    locale: string = "1033",
    formContext: any,
): ControlJsonSchema {
    try {
        console.group("getJsonSchema");
        console.log(arguments);
        const description = attribute.locale?.[locale]?.description ?? attribute.description;

        const type =
            typeof attribute.type === "object"
                ? attribute.type.type
                : attribute.type;

        const typeProps =
            typeof attribute.type === "object"
                ? attribute.type
                : ({} as NestedType);


        const controlType = field.control ??
            ((typeProps as any)['format'] === "html" ? "RichTextEditorControl" : field.control);


        const defaultProps: ControlJsonSchema = {
            title: field.displayName ??
                attribute?.locale?.[locale]?.displayName ??
                attribute.displayName,

            readOnly: attribute.readonly || field.readonly,
            ["x-description"]: description,
            ["x-control"]: typeof (controlType) === "object" ? controlType.type : controlType,
            "x-widget": field.visible === false ? "hidden" : undefined,
            "x-field": field.visible === false ? "hidden" : undefined,
            "x-logicalname": attribute.logicalName,
            "x-widget-props": {
                placeholder: attribute.readonly ? "beregnes automatisk ved gem" : undefined,
                disabled: field.disabled,

                ...formContext,
            }
        };



        if (formContext.isCreate) {
            defaultProps["default"] = attribute.default ?? field.default;
        }

        if (field.minLength) {
            defaultProps.minLength = field.minLength;
        }


        if (defaultProps["x-control"]) {
            defaultProps["x-field"] = "ControlHostWidget";

            if (typeof field.control === "object") {
                defaultProps["x-widget-props"]["x-control-props"] = field.control;
            }
        }

        console.log(defaultProps);
        switch (type) {
            case "decimal":
                //Fixes https://github.com/rjsf-team/react-jsonschema-form/pull/2497
                return {
                    ...defaultProps,
                    type: "number",
                };
            case "integer":
                //Fixes https://github.com/rjsf-team/react-jsonschema-form/pull/2497
                return {
                    ...defaultProps,
                    type: "integer"
                };
            case "boolean":
                return {
                    ...defaultProps,
                    type: "boolean",
                };
            case "string":
            case "text":
                return {
                    ...defaultProps,
                    type: "string",
                    format: (typeProps as StringType).format
                };

            case "datetime":
                return {
                    ...defaultProps,
                    type: "string",
                    format: "date-time",
                };
            case "multilinetext":



                return {
                    ...defaultProps,
                    type: "string",
                    "x-widget": field.visible === false ? "hidden" : "textarea",
                    "x-widget-props": {
                        ...defaultProps["x-widget-props"],
                        resizable: false,
                        styles: {
                            ...(defaultProps["x-widget-props"]?.["styles"] ?? {}), field: { ...(defaultProps["x-widget-props"]?.["styles"]?.["field"] ?? {}), height: 200, }
                        },
                    },
                };
            case "choice": {
                let options = (typeProps as ChoiceType).options ?? {};

                return {
                    ...defaultProps,
                    type: "number",
                    enum: Object.entries(options).map(entry => enumValuesFactory(entry, locale)),
                    enumNames: Object.entries(options).map(entry => enumDisplayNameFactory(entry, locale)),
                };
            }
            case "choices": {
                let options = (typeProps as ChoiceType).options ?? {};

                return {
                    ...defaultProps,
                    type: "array",
                    uniqueItems: true,
                    "x-field": "ControlHostWidget",
                    "x-control": "ChoicesControl",
                    items: {
                        type: "object",
                        properties: {
                            "allowedgranttype": {
                                type: "number",
                                enum: Object.values(options),
                                enumNames: Object.keys(options),
                            }
                        }
                    }
                };
            }
            default:
                return {
                    ...defaultProps,
                    type: "string",
                    "x-field": field.visible === false ? "hidden" : "ControlHostWidget",
                };
        }
    } finally {
        console.groupEnd();
    }
}
