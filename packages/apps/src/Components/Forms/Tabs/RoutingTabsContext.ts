import { IPivotProps } from "@fluentui/react";

export type RoutingTabsContext = {
    tabName: string;
    onTabChange: IPivotProps["onLinkClick"]
}