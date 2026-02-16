import { IWizardMessages, WizardsDefinition } from '@eavfw/manifest';
import { Span, Tracer } from '@opentelemetry/api';
import { WorkflowState } from '@eavfw/utils';
import type { Context } from '@opentelemetry/api';

export type IWizardState = {
  tabName?: string;
  wizard?: WizardsDefinition;
  wizardKey?: string;
  expressions?: Record<string, unknown>;
  messages?: IWizardMessages;
  isTransitioning?: boolean;
  transition?: Promise<WorkflowState>;
  values?: Record<string, unknown>;
  tracer?: Tracer;
  span?: Span;
  spanResolve?: (value?: unknown) => void;
  spanReject?: () => void;
  spanPromize?: Promise<unknown>;
  otelContext?: Context;
};
