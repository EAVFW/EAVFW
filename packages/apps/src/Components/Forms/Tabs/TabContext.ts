import { createContext } from "react";
import { RoutingTabsContext } from "./RoutingTabsContext";

export const TabContext = createContext<RoutingTabsContext>({ tabName: "", onTabChange: (e, ee) => { } });