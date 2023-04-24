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
    layout: {
        tabs: {
            [tabName: string]: FormTabDefinition;
        };
    };
    columns: {
        [columnName: string]: FormColumnDefinition;
    };
};
