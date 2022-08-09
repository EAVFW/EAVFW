import { EntityDefinition } from "../Entities";
import { RibbonViewInfo } from "../Ribbon";
import { ViewDefinition } from "./ViewDefinition";


export type ViewReference = {
    ribbon?: RibbonViewInfo,
    key: string,
    entity: EntityDefinition,
    viewName?: string; entityName: string; attribute: string,
    filter?: string,
    view?: ViewDefinition
}