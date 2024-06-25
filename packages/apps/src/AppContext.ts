import { Dispatch, createContext } from "react";
import { ModelDrivenApp } from "./ModelDrivenApp";

export type AppContextType = {
    model: ModelDrivenApp,
    isModelDrivenNavigationOpen: boolean,
}
export type AppContextActions = {
    toggleNav: () => void;
}
const defaultActions: AppContextActions = { toggleNav: () => { } };
const defaultContext: AppContextType = { model: new ModelDrivenApp(), isModelDrivenNavigationOpen: true };
export const AppContext = createContext<[AppContextType, AppContextActions]>([defaultContext, defaultActions]);