import { AttributeTypeDefinition } from "../AttributeTypeDefinition";
import { ChoiceType } from "./ChoiceType";

export function isChoice(type: AttributeTypeDefinition): type is ChoiceType {
    return typeof (type) === "object" && type.type === "choice";
}