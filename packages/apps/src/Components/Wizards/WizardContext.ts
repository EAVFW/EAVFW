import { createContext } from "react";
import { IWizardAction } from "./IWizardAction";
import { IWizardState } from "./IWizardState";

export const WizardContext = createContext<[IWizardState, React.Dispatch<IWizardAction>] | undefined>(undefined);