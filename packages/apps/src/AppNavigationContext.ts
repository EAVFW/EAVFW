import { createContext } from "react";
import { AppNavigationContextProps } from "./AppNavigationContextProps";



export const AppNavigationContext = createContext<AppNavigationContextProps | undefined>(undefined);