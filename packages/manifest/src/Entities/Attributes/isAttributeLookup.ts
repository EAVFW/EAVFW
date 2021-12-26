import { AttributeDefinition } from "./AttributeDefinition";
import { getAttributeType } from "./getAttributeType";
import { LookupAttributeDefinition } from "./LookupAttributeDefinition";

export function isAttributeLookup(attribute: AttributeDefinition): attribute is LookupAttributeDefinition {
    return getAttributeType(attribute) === "lookup";
}