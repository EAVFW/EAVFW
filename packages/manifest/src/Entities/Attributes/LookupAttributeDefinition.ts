import { LookupType } from "./Types/Lookup/LookupType";
import { AttributeDefinition } from "./AttributeDefinition";

export type LookupAttributeDefinition = AttributeDefinition & {
    type: LookupType;
};