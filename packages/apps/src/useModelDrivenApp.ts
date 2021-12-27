import { useContext } from "react";
import { AppContext } from "./AppContext";


export const useModelDrivenApp = () => useContext(AppContext);