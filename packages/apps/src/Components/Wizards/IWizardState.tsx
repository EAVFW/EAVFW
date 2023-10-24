import { IWizardMessages, WizardsDefinition } from "@eavfw/manifest";
import { Span, Tracer } from "@opentelemetry/api";
import { WorkflowState } from "./WorkflowState";
import type { Context } from "@opentelemetry/api"

export type IWizardState = {
    tabName?: string;
    wizard?: WizardsDefinition;
    wizardKey?: string;
    expressions?: any;
    messages?: IWizardMessages;
    isTransitioning?: boolean;
    transition?: Promise<WorkflowState>;
    values?: any;
    tracer?: Tracer,
    span?: Span
    spanResolve?: (value?:any) => void;
    spanReject?: () => void;
    spanPromize?: Promise<any>
    otelContext?: Context
};
