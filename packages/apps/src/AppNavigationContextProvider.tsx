

import { AppNavigationContextProps } from "@eavfw/apps";
import { AppNavigationContext } from "./AppNavigationContext";

export const AppNavigationContextProvider: React.FC<{ navModel: AppNavigationContextProps }> = ({ children, navModel }) => {

     
    return (

        <AppNavigationContext.Provider value={navModel}>
            {children}
        </AppNavigationContext.Provider>

    )
}

