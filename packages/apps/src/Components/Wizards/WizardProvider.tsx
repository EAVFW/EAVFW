import { EAVForm } from "@eavfw/forms";
import { useState } from "react";
import { WizardReducer } from "./WizardReducer";

export const WizardProvider: React.FC<{}> = ({ children }) => {


    return (
        <WizardReducer>
            {children}
        </WizardReducer>

    )

    return (
        <EAVForm   onChange={(data, ctx) => {
            console.log("WziardData", data, ctx);
            
        }}><WizardReducer >
                {children}
            </WizardReducer>

        </EAVForm>

    )
}