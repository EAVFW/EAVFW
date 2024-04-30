import { EAVForm } from "@eavfw/forms";
import { PropsWithChildren, useState } from "react";
import { WizardReducer } from "./WizardReducer";

export const WizardProvider: React.FC<PropsWithChildren> = ({ children }) => {


    return (
        <WizardReducer>
            {children}
        </WizardReducer>

    )

}