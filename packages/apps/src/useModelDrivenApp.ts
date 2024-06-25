import { useContext } from "react";
import { AppContext } from "./AppContext";

/**
 * 
 * @deprecated Use useEAVApp
 * 
 */

export const useModelDrivenApp = () => useContext(AppContext)[0].model;

export const useEAVApp = () => useContext(AppContext);