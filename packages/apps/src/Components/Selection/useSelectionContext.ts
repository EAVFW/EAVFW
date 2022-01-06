import { useContext } from "react";
import { ModelDrivenGridViewerSelectedContext } from "./ModelDrivenGridViewerSelectedContext";


export const useSelectionContext = () => useContext(ModelDrivenGridViewerSelectedContext);
