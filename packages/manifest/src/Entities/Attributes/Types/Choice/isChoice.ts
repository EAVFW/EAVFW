import { AttributeTypeDefinition } from "../AttributeTypeDefinition";
import { ChoiceType } from "./ChoiceType";

export function isChoice(type: AttributeTypeDefinition): type is ChoiceType {
    return typeof (type) !== "string" && type.type === "choice";
}