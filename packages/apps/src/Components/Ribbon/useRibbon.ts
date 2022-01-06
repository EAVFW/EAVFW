import { useContext } from "react";
import { RibbonContext } from "./RibbonContext";
 


export const useRibbon = () => useContext(RibbonContext);
