import { EntityDefinition, IRecord } from "@eavfw/manifest";

export type ModelDrivenBodyViewerState = {
    locale: string;
    viewName?: string;
    entity: EntityDefinition;
    entityName?: string;
    padding?: number
    recordRouteGenerator: (record: IRecord) => string;
    showViewSelector?: boolean;
}