import { EAVFWErrorDefinition, ManifestDefinition } from '@eavfw/manifest';

export type EAVFormContextState<T> = {
  formValues: T;
  formDefinition?: ManifestDefinition;
  fieldMetadata: Record<string, unknown>;
  errors: EAVFWErrorDefinition;
  isErrorsUpdated: boolean;
};
