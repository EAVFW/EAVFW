import { JSONSchema7 } from "json-schema";
import { EntityDefinition } from "@eavfw/manifest";
import { ModelDrivenApp } from "../../../../ModelDrivenApp";
import { getJsonSchema } from "./getJsonSchema";


export function getDependencySchema(fields: any[], field: any, entity: EntityDefinition, app: ModelDrivenApp, formName: string, formContext: any): JSONSchema7 {
    const type = entity.attributes[field!].type;
    if (type === "boolean" || (typeof type !== "string" && type.type === "boolean")) {

        //https://jsfiddle.net/scoutm3d/3/
        function gen(value: boolean) {
            let prop = {} as any
                ;
            prop[entity.attributes[field!].logicalName] = { "enum": [value] }
            return prop;
        }

        return {
            oneOf: [
                {
                    properties: {
                        ...gen(true),
                        ...Object.fromEntries(fields.filter(f => f.field.dependant === field)
                            .map(field => [field.attribute.logicalName, getJsonSchema(field.attribute, field.field, entity, app.locale, {
                                entityName: entity.logicalName,
                                fieldName: field.fieldName,
                                attributeName: field.attributeName,
                                formName,
                                ...formContext
                            })]))
                    }
                },
                {
                    properties: {
                        ...gen(false),
                    }
                }
            ]
        }
    }

    return {
        properties: Object.fromEntries(fields.filter(f => f.field.dependant === field)
            .map(field => [field.attribute.logicalName, getJsonSchema(field.attribute, field.field, entity, app.locale, {
                entityName: entity.logicalName,
                fieldName: field.fieldName,
                attributeName: field.attributeName,
                formName,
                ...formContext
            })]))
    };
}
