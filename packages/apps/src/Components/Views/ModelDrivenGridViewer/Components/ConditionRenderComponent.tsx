import React from "react";

import {
    IColumn,
} from "@fluentui/react";
import Link from "next/link";
import {
    AttributeDefinition,
    ChoiceType,
    EntityDefinition,
    isChoice,
    isLookup,
    isPolyLookup,
    LookupAttributeDefinition,
    NestedType,
} from "@eavfw/manifest";
import { useModelDrivenGridViewerContext } from "../ModelDrivenGridViewerContext";
import { Controls } from "../../../Controls/ControlRegister";
import { useModelDrivenApp } from "../../../../useModelDrivenApp";
import { useAppInfo } from "../../../../useAppInfo";
import { ModelDrivenApp } from "../../../../ModelDrivenApp";
import {
    isAttributeLookupEntry,
} from "../../../ColumnFilter/ColumnFilterContext";


export const ConditionRenderComponent: React.FC<{
    [key: string]: any, column?: IColumn, entity: EntityDefinition
}> = ({
    recordRouteGenerator,
    entity,
    item,
    index,
    column,
    setItems,
    items,
    locale,
}) => {

        if (!column)
            throw new Error("Column not defined");


        const attribute = column.data as AttributeDefinition;


        const { onRenderPrimaryField: RenderPrimaryField } =
            useModelDrivenGridViewerContext();

        const type = attribute.type as NestedType;

        if (isChoice(type) && item) {
            return <RenderChoiceColumn value={item[column?.fieldName as string]} type={type} locale={locale} />

        } else if (attribute.isPrimaryField) {
            return (
                <RenderPrimaryField
                    recordRouteGenerator={recordRouteGenerator}
                    item={item}
                    column={column}
                />
            );
            //        return <Link href={recordRouteGenerator(item)}><a>{item[column?.fieldName!] ?? '<ingen navn>'}</a></Link>

        } else if (isLookup(type)) {

            if (column.key.indexOf('/') !== -1) {


                const app = useModelDrivenApp();
                const [subitem, value, lookup] = traverseRecordPath(app, column, item);

                if (isChoice(lookup.type)) {
                    return <RenderChoiceColumn value={value} type={lookup.type} locale={locale} />
                }

                // console.log("Lookup With Traverse", [column.key, item, subitem, lookup]);
                return <Link legacyBehavior={true} href={recordRouteGenerator({ id: subitem.id, entityName: subitem?.["$type"] ?? lookup.type.foreignKey?.principalTable! })} >

                    <a>{value}</a>

                </Link>
            }

            if (!(attribute.logicalName in item)) {
                return null;
            }

            const linkedItem = item[attribute.logicalName.slice(0, -2)];

            if (isPolyLookup(type)) {
                const app = useModelDrivenApp();
                const { currentEntityName } = useAppInfo();
                if (type.inline) {
                    const lookups = Object.entries(app.getAttributes(entity.logicalName)).filter(isAttributeLookupEntry);

                    const lookupsFromReferenceTypes = type.referenceTypes.map(referenceType => lookups.filter(a => a[1].type.referenceType === referenceType && a[1].logicalName.slice(0, -2) in item))
                        .filter(x => x.length > 0)[0][0];

                    const referenceItem = item[lookupsFromReferenceTypes[1].logicalName.slice(0, -2)];
                    return <Link legacyBehavior={true} href={recordRouteGenerator({
                        id: item[attribute.logicalName], //item[lookupsFromReferenceTypes[1].logicalName],
                        entityName: referenceItem?.["$type"] ?? lookupsFromReferenceTypes[1].type?.foreignKey?.principalTable!
                    })} >

                        <a>{referenceItem[lookupsFromReferenceTypes[1].type.foreignKey?.principalNameColumn?.toLowerCase()!]}</a>

                    </Link>
                }

                const referenceType = Object.values(app.getAttributes(app.getEntityFromKey(type.referenceType).logicalName))
                    .filter(a => a.logicalName in linkedItem)[0] as LookupAttributeDefinition;

                const referenceItem = linkedItem[referenceType.logicalName.slice(0, -2)];
                // return <div>{linkedItem[referenceType.logicalName]}</div>;

                return <Link legacyBehavior={true} href={recordRouteGenerator({
                    id: linkedItem[referenceType.logicalName],
                    entityName: referenceItem?.["$type"] ?? referenceType.type?.foreignKey?.principalTable!
                })} >

                    <a>{referenceItem[referenceType.type.foreignKey?.principalNameColumn?.toLowerCase()!]}</a>

                </Link>
            }

            return <Link legacyBehavior={true} href={recordRouteGenerator({ id: item[attribute.logicalName], entityName: item[attribute.logicalName.slice(0, -2)]?.["$type"] ?? type.foreignKey?.principalTable! })} >

                <a>{item[attribute.logicalName.slice(0, -2)][type.foreignKey?.principalNameColumn?.toLowerCase()!]}</a>

            </Link>


        } else if (column.data.control && column.data.control in Controls) {
            const CustomControl = Controls[column.data.control] as React.FC<{
                value: any;
            }>;

            return <CustomControl value={item[attribute.logicalName]}></CustomControl>;
        } else if (type.type === "datetime") {
            let value =
                item && column && column.fieldName ? item[column.fieldName] : "";

            return <>{convertDateTimeFormat(value)}</>;
        }

        return <>{getCellText(item, column)}</>;
    };



/**
 * Converts a SQL DateTime format to the format DD-MM-YYYY HH:MM:SS.
 * @param inputDateTime The input date and time in SQL DateTime format.
 * @returns The formatted date and time string in DD-MM-YYYY HH:MM:SS format.
 */
function convertDateTimeFormat(inputDateTime: string): string {
    if (inputDateTime != undefined) {
        const inputDate = new Date(inputDateTime);

        const day = String(inputDate.getDate()).padStart(2, "0");
        const month = String(inputDate.getMonth() + 1).padStart(2, "0");
        const year = inputDate.getFullYear();

        const hours = String(inputDate.getHours()).padStart(2, "0");
        const minutes = String(inputDate.getMinutes()).padStart(2, "0");
        const seconds = String(Math.round(inputDate.getSeconds())).padStart(2, "0");

        const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
        return formattedDateTime;
    } else {
        return inputDateTime;
    }
}



/**
 * Retrieves the text content of a cell based on the provided item and column information.
 * @param item The data item representing a row.
 * @param column The column information object.
 * @returns The text content to be displayed in the cell.
 */
const getCellText = (item: any, column: IColumn): string => {
    // Get the value from the item's property specified by the column's fieldName.
    let value = item && column && column.fieldName ? item[column.fieldName] : "";

    // Handle null or undefined values by setting them to an empty string.
    if (value === null || value === undefined) {
        value = "";
    }

    // Convert boolean values to string representation.
    if (typeof value === "boolean") {
        return value.toString();
    }

    // Convert and format the value as a date and time string.
    return value;
};


const RenderChoiceColumn: React.FC<{ value: any, type: ChoiceType, locale: string }> = ({ value, type, locale }) => {


    if (value || value === 0) {
        const [key, optionValue] = Object.entries<any>(type.options ?? {})
            .filter(([key, option]) =>
                (typeof option === "number" ? option : option.value) === value
            )[0];

        return (
            <>
                {optionValue?.locale?.[locale]?.displayName ??
                    optionValue?.text ??
                    key}
            </>
        );
    }
    return null;
}

function traverseRecordPath(app: ModelDrivenApp, column: IColumn, item: any): [any, any, any] {
    throw new Error("Function not implemented.");
}
