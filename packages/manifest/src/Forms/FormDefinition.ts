import { RibbonViewInfo } from "../Ribbon";
import { FormColumnDefinition, FormTabDefinition } from "./FormLayout";

export type FormDefinition = {
    type: "Main" | "Modal" | "QuickCreate";
    name: string;
    ribbon?: RibbonViewInfo,
    buttons?: {
        save?: {
            text?: string
        };
        cancel?: {
            text?: string
        }
    };
    query?:any,
    scripts?: {
        onInit?: {
            [name: string]: string;
        };
        preSave?: {
            [name: string]: string;
        };
    };
    layout: {
        tabs: {
            [tabName: string]: FormTabDefinition;
        };
    };
    columns: {
        [columnName: string]: FormColumnDefinition;
    };
};
