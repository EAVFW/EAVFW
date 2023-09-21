import { TypeFormDefinition, TypeFormModalDefinition } from "../../../../Forms";

export type PolyLookupType = {
    type: "polylookup",
    referenceType: string;
    referenceTypes: Array<string>;

} & LookupType
export type NormalLookupType = {
    type: "lookup"

}
export type LookupType =
    {
        type: "lookup" | "polylookup"
        referenceType: string;
        referenceTypes?: Array<string>;
        inline?: boolean;
        forms?: {
            [formKey: string]: TypeFormDefinition | TypeFormModalDefinition;
        };
        filter?: string;
        foreignKey?: {
            principalTable: string;
            principalColumn: string;
            principalNameColumn: string;
            name: string;

        };
        cascade?: {
            delete?: "cascade" | "noaction" | "restrict",
            update?: "cascade" | "noaction" | "restrict"
        }
    }