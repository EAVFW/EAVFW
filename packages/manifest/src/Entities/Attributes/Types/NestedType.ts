import { BaseNestedType } from "./BaseNestedType";
import { ChoiceType } from "./Choice/ChoiceType";
import { ChoicesType } from "./Choices/ChoicesType";
import { LookupType } from "./Lookup/LookupType";
import { DecimalType } from "./Number/DecimalType";
import { IntegerType } from "./Number/IntegerType";
import { PrimitiveTypeDefinition } from "./PrimitiveTypeDefinition";
import { StringType } from "./String/StringType";


export type NestedType =
    BaseNestedType &
    (   | StringType
        | ChoiceType
        | LookupType
        | IntegerType
        | DecimalType
        | ChoicesType
        | PrimitiveTypeDefinition
    );