import { EAVForm } from "@eavfw/forms";
import { useState } from "react";
import { WizardReducer } from "./WizardReducer";

export const WizardProvider: React.FC<{}> = ({ children }) => {


    const [defaultdata, setDefaultData] = useState(() => ({}));


    return (
        <EAVForm defaultData={defaultdata} onChange={(data, ctx) => {
            console.log("WziardData", data, ctx);
            setDefaultData(data);
        }}><WizardReducer data={defaultdata}>
                {children}
            </WizardReducer>

        </EAVForm>

    )
}