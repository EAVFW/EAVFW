import { AttributeDefinition } from "./AttributeDefinition";

export function getNavigationProperty(a: AttributeDefinition) {
    return a.logicalName.endsWith("id")
        ? a.logicalName.slice(0, -2)
        : a.logicalName;
}