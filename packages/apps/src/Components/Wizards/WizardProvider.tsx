import { EAVForm } from '@eavfw/forms';
import { PropsWithChildren, useState } from 'react';
import { WizardReducer } from './WizardReducer';

export const WizardProvider = ({ children }: PropsWithChildren) => {
  return <WizardReducer>{children}</WizardReducer>;
};
