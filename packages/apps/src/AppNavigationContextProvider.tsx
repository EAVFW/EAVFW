

import { AppNavigationContextProps } from "@eavfw/apps";
import { AppNavigationContext } from "./AppNavigationContext";
import { PropsWithChildren } from "react";

export const AppNavigationContextProvider: React.FC<PropsWithChildren<{ navModel: AppNavigationContextProps }>> = ({ children, navModel }) => {

    return (

        <AppNavigationContext.Provider value={navModel}>
            {children}
        </AppNavigationContext.Provider>

    )
}