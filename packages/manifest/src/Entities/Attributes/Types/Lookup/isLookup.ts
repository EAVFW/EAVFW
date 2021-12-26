import { AttributeTypeDefinition } from "../AttributeTypeDefinition";
import { LookupType } from "./LookupType";

export function isLookup(type: AttributeTypeDefinition): type is LookupType {
    return typeof (type) === "object" && type.type === "lookup";
}