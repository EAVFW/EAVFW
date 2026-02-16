import { FormDefinition, NestedType } from '@eavfw/manifest';
import { FormValidation } from '@rjsf/utils';

export type FormRenderProps = {
  stickyFooter?: boolean;
  hideFooter?: boolean;
  record?: Record<string, unknown>;
  type?: NestedType;
  forms?: string[];
  formName?: string;
  dismissPanel: (ev: 'save' | 'cancel') => void;
  onChange: (data: Record<string, unknown>, ctx?: { autoSave?: boolean }) => void;
  entityName?: string;
  extraErrors?: FormValidation;
  saveBtnText?: string;
  cancelBtnText?: string;
};
