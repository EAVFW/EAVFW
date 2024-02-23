import { IPivotProps } from "@fluentui/react";

export type RoutingTabsContext = {
    tabName: string;
    tabs: string[];
    setTabs: (tabs: string[]) => void;
    onTabChange: (tabName: string) => void;
}