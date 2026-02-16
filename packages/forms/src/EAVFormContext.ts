import { ManifestDefinition } from '@eavfw/manifest';
import { createContext } from 'react';
import { EAVFormContextProps } from './EAVFormContextProps';
import { EAVFormContextState } from './EAVFormContextState';

export const EAVFormContext = createContext<
  EAVFormContextProps<Record<string, unknown>, EAVFormContextState<Record<string, unknown>>>
>({
  purpose: 'empty',
  actions: {
    runValidation: () => false,
    addVisited: (id) => {
      throw new Error('EAVFormContext not created');
    },
    onChange: () => {
      throw new Error('EAVFormContext not created');
    },
    updateState: () => {
      throw new Error('EAVFormContext not created');
    },
    useCollector: (a) => {
      throw new Error('EAVFormContext not created');
    },
  },
  state: {
    formDefinition: {} as ManifestDefinition,
    errors: {},
    formValues: {},
    fieldMetadata: {},
    isErrorsUpdated: false,
  },
  etag: new Date().toISOString(),
});
