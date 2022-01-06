import { createContext } from "react";
import { RibbonContextProps } from "./RibbonContextProps";
import { RibbonState } from "./RibbonState";

export const RibbonContext = createContext<RibbonState & RibbonContextProps>({} as any);
