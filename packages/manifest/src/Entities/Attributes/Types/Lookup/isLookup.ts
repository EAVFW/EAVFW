import { AttributeTypeDefinition } from "../AttributeTypeDefinition";
import { LookupType, PolyLookupType } from "./LookupType";

export function isLookup(type: AttributeTypeDefinition): type is LookupType {
    return typeof (type) === "object" && (type.type?.toLowerCase() === "lookup" || type.type?.toLowerCase() === "polylookup");
}


export function isPolyLookup(type: AttributeTypeDefinition): type is PolyLookupType {
    return typeof (type) === "object" && type.type?.toLowerCase() === "polylookup";
}