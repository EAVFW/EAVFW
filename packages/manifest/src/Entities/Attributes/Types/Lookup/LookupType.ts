import { TypeFormDefinition, TypeFormModalDefinition } from "../../../../Forms";


export type LookupType = {
    type: "lookup";
    referenceType: string;
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
};