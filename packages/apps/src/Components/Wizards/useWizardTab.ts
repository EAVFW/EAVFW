import { useContext } from "react";
import { WizardContext } from "./WizardContext";

export const useWizardTab = () => {
    const [state, dispatch] = useContext(WizardContext)!;

    return state.tabName;
}
