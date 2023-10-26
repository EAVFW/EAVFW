import { createContext, useContext } from "react";




const WarningContext = createContext<Array<{ logicalName: string, warning: string }>>([]);
export const useWarnings = () => useContext(WarningContext);
export const WarningContextProvider = WarningContext.Provider;