import { AttributeDefinition } from "./AttributeDefinition";


export function getAttributeType(attribute: AttributeDefinition) {
    return typeof attribute.type === "string" ? attribute.type : attribute.type.type;
}