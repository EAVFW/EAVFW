import { createContext } from "react";
import { RoutingTabsContext } from "./RoutingTabsContext";

export const TabContext = createContext<RoutingTabsContext>({ setTabs: (a) => { }, tabs: [] as string[], tabName: "", onTabChange: (tabName) => { } });