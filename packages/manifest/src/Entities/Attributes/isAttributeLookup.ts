import { AttributeDefinition } from "./AttributeDefinition";
import { getAttributeType } from "./getAttributeType";
import { LookupAttributeDefinition } from "./LookupAttributeDefinition";

export function isAttributeLookup(attribute: AttributeDefinition): attribute is LookupAttributeDefinition {
    const type = getAttributeType(attribute);
    return type === "lookup" || type === "polylookup" ;
}