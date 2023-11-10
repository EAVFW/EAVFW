import { IPivotProps } from "@fluentui/react";
import { EntityDefinition, IRecord } from "@eavfw/manifest";

export type ModelDrivenBodyViewerProps = {
    locale: string;
    viewName?: string;
    entity: EntityDefinition;
    entityName?: string;
    padding?: number
    recordRouteGenerator: (record: IRecord) => string;
    showViewSelector?: boolean;
    tabName?: string;
    onTabChange?: IPivotProps["onLinkClick"];
};