import { IWizardMessages, WizardsDefinition } from "@eavfw/manifest";
import { WorkflowState } from "./WorkflowState";


export type IWizardState = {
    tabName?: string;
    wizard?: WizardsDefinition;
    wizardKey?: string;
    expressions?: any;
    messages?: IWizardMessages;
    isTransitioning?: boolean;
    transition?: Promise<WorkflowState>;
    values?: any;
};
