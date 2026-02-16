import { EntityDefinition } from '@eavfw/manifest';
import { FormsConfig } from '../../FormsConfig';
import { OptionsFactory } from './AutoForm/OptionsFactory';
import { FormValidation } from '@rjsf/utils';

export type ModelDrivenEntityViewerProps = {
  entity: EntityDefinition;
  locale: string;
  entityName: string;
  formName: string;
  record?: Record<string, unknown>;
  factory?: OptionsFactory;
  onChange?: (data: Record<string, unknown>, ctx?: Record<string, unknown>) => void;
  related?: Array<string>;
  extraErrors?: FormValidation;
} & FormsConfig;
