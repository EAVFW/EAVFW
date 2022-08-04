import { EntityDefinition } from "../Entities";
import { RibbonViewInfo } from "../Ribbon";


export type ViewReference = {
    ribbon?: RibbonViewInfo,
    key: string,
    entity: EntityDefinition,
    viewName?: string; entityName: string; attribute: string,
    filter?:string,
    view?: {
        control?: string, columns?: any,
        ribbon?: RibbonViewInfo
    }
}