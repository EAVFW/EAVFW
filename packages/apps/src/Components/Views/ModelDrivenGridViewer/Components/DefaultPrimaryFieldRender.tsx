import Link from "next/link";
import {
    AttributeDefinition,
    EntityDefinition,
    IRecord,
    isAttributeLookup,
    LookupType,
    queryEntitySWR,
} from "@eavfw/manifest";
import { ModelDrivenApp } from "../../../../ModelDrivenApp";
import { useModelDrivenApp } from "../../../../useModelDrivenApp";
import { IColumn } from "@fluentui/react";

export type DefaultPrimaryFieldRenderProps = { recordRouteGenerator: (record: IRecord) => string; item: IRecord, column: IColumn }

export const DefaultPrimaryFieldRender: React.FC<DefaultPrimaryFieldRenderProps> = ({ recordRouteGenerator, item, column }) => {


    if (column.key.indexOf('/') !== -1) {


        const app = useModelDrivenApp();
        const [subitem, value] = traverseRecordPath(app, column, item);


        return <Link legacyBehavior={true} href={recordRouteGenerator(subitem)}><a>{value}</a></Link>;
    }
    let value = item[column?.fieldName!] ?? '<ingen navn>';
    return <Link legacyBehavior={true} href={recordRouteGenerator(item)}><a>{value}</a></Link>;
}

const traverseRecordPath = (app: ModelDrivenApp, column: IColumn, subitem: any) => {



    let parts = column.key.split('/');
    let navattributes = app.getEntity(subitem['$type']).attributes;
    let value = null as any;
    console.log("DefaultPrimaryFieldRender", [column.key, parts, navattributes])
    while (parts.length) {

        let nav = parts.shift()!;
        let attribute = navattributes[nav];
        if (isAttributeLookup(attribute)) {


            subitem = subitem[attribute.logicalName.slice(0, -2)];

            if (parts.length === 0)
                return [subitem, subitem[attribute.type.foreignKey?.principalNameColumn?.toLowerCase()!], attribute];

            navattributes = app.getEntityFromKey(attribute.type.referenceType).attributes;
            console.log("DefaultPrimaryFieldRender", [nav, parts.length, navattributes, attribute, subitem])
        } else {
            console.log("DefaultPrimaryFieldRender", [parts, navattributes])
            value = subitem[attribute.logicalName];
            return [subitem, value, attribute];
        }
    }
    return [subitem, value];
}