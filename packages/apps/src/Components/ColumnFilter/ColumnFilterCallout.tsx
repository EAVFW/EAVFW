import { useModelDrivenApp } from "@eavfw/apps";
import {
    Callout,
    DefaultButton,
    Dropdown,
    IColumn, IconButton,
    IDropdownOption,
    IIconProps,
    PrimaryButton,
    SpinButton,
    Stack,
    Target,
    TextField
} from "@fluentui/react";
import React, { useEffect, useState } from "react";

import { IColumnData } from "./IColumnData";
import { ColumnOrder } from "./ColumnOrder";
import { ColumnOptions } from "./ColumnOptions";
import { ColumnFilterProps } from "./ColumnFilterProps";
import { AttributeTypeDefinition, LookupType, NestedType } from "@eavfw/manifest";

//function _copyAndSort<T>(items: T[], columnKey: keyof T, isSortedDescending?: boolean): T[] {
//    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[columnKey] < b[columnKey] : a[columnKey] > b[columnKey]) ? 1 : -1));
//}

/**[
 * Composes the OData filter part for the given column, filterText and filterOption.
 * @param filterValue The input for the filter operation
 * @param filterOption contains, startswith, etc.
 * @param columnKey The column key on which the filter is applied
 */
function composeOdataFilterExpression(filterValue: string | number, filterOption: ColumnOptions, columnKey?: string) {
    if (columnKey == null) return;

    const filterValueFormatted = 
        typeof filterValue === "string"
        ? `\'${filterValue}\'`
        : `${filterValue}`
        
    switch (filterOption) {
        case ColumnOptions.Equals:
            return `${columnKey} ${ColumnOptions.Equals} ${filterValueFormatted}`;
        case ColumnOptions.Contains:
            return `${ColumnOptions.Contains}(${columnKey}, ${filterValueFormatted})`;
        case ColumnOptions.EndsWith:
            return `${ColumnOptions.EndsWith}(${columnKey}, ${filterValueFormatted})`;
        case ColumnOptions.StartsWith:
            return `${ColumnOptions.StartsWith}(${columnKey}, ${filterValueFormatted})`;
    }
}


/**[
 * Composes the OData filter part for the given column, filterText and filterOption.
 * @param filterValue The input for the filter operation
 * @param filterOption contains, startswith, etc.
 * @param column The column on which the filter is applied
 */
function composeOdataFilterPart(filterValue: string, filterOption: ColumnOptions, column: IColumn): string | undefined {
    if (typeof (column.data?.type) != "object") return composeOdataFilterExpression(filterValue, filterOption, column.fieldName);

    const columnType = column.data?.type as NestedType
    switch (columnType.type) {
        case "string": return composeOdataFilterExpression(filterValue, filterOption, column.fieldName)
        
        case "integer":
        case "decimal": return composeOdataFilterExpression(+filterValue, filterOption, column.fieldName)
        case "lookup": {
            const lookup = columnType as LookupType
            if (lookup.foreignKey == null) return composeOdataFilterExpression(filterValue, filterOption, column.fieldName)

            const columnKey = `${lookup.foreignKey.name}/${lookup.foreignKey.principalNameColumn}`
            return composeOdataFilterExpression(filterValue, filterOption, columnKey)
        }
    }
}

/**
 * CallOut element giving the possibility to filter columns.
 * @param props
 * @constructor
 */
export const ColumnFilterCallout: React.FC<ColumnFilterProps> = (
    {
        columns,
        //  setColumns,
        //  items,
        //  setItems,
        menuTarget,
        isCalloutVisible,
        toggleIsCalloutVisible,
        currentColumn,
        fetchCallBack
    }) => {


    const [filterValue, setFilterText] = useState<string>();
    const app = useModelDrivenApp();

    const [filterOption, setFilterOption] = useState(ColumnOptions.Contains)

    const clearLabel = app.getLocalization('clear') ?? 'Clear';
    const applyLabel = app.getLocalization('apply') ?? 'Apply';
    const to = app.getLocalization('to') ?? 'to';
    const aToz = `A ${to} Z`;
    const zToa = `Z ${to} A`;

    const filterOptions = [
        {
            key: ColumnOptions.Contains,
            enumValue: ColumnOptions.Contains,
            text: (app.getLocalization(ColumnOptions.Contains) ?? 'Contains')
        },
        {
            key: ColumnOptions.Equals,
            enumValue: ColumnOptions.Equals,
            text: (app.getLocalization(ColumnOptions.Equals) ?? 'Equals')
        },
        /*        {
                    key: options.EndsWith,
                    enumValue: options.EndsWith,
                    text: (app.getLocalization(options.EndsWith) ?? 'Ends with')
                },
                {
                    key: options.StartsWith,
                    enumValue: options.StartsWith,
                    text: (app.getLocalization(options.StartsWith) ?? 'Starts with')
                },*/
    ];

    const updateCurrentColumnData = (data?: IColumnData) => {
        const newColumns: IColumn[] = columns.slice();
        const current = columns.findIndex(x => x.key === currentColumn?.key);
        currentColumn!.data['columnFilter'] = data;
        if (data !== undefined) {
            currentColumn!.iconName = "Filter";
        } else {
            currentColumn!.iconName = undefined;
        }
        newColumns[current] = currentColumn! as IColumn;
        // setColumns(newColumns);
    }

    const applyColumnFilter = () => {

        if (filterValue !== undefined && currentColumn !== undefined) {
            console.log("Current column", currentColumn)
            const odataFilterText = composeOdataFilterPart(filterValue, filterOption, currentColumn);
            const data: IColumnData = { filterText: filterValue, odataFilter: odataFilterText, filterOption: filterOption }

            updateCurrentColumnData(data);
        }
        toggleIsCalloutVisible();
        fetchCallBack();
    }

    const clearColumnFilter = () => {
        updateCurrentColumnData()
        toggleIsCalloutVisible();
        fetchCallBack();
    }

    const sortCurrentColumn = (order: ColumnOrder) => {
        console.log("Sorting...", [order, currentColumn])

        const newColumns: IColumn[] = columns.slice();

        console.log([newColumns, currentColumn]);
        const currColumn: IColumn = newColumns.filter(currCol => currentColumn?.key === currCol.key)[0];

        newColumns.forEach((newCol: IColumn) => {
            if (newCol.key === currColumn.key) {
                currColumn.isSortedDescending = order === ColumnOrder.Down;
                currColumn.isSorted = true;
            } else {
                newCol.isSorted = false;
                newCol.isSortedDescending = true;
            }
        });

        toggleIsCalloutVisible();
        fetchCallBack();

        //   const newItems = _copyAndSort(items, currColumn.fieldName!, currColumn.isSortedDescending);
        //  console.log("Items sorted", newColumns, items.length, newItems.length);

        //        setItems(newItems);

        //  setColumns(newColumns);
    };

    // Load saved filter data
    useEffect(() => {
        if (isCalloutVisible) {
            console.log("toggleColumn", ["triggered", currentColumn?.data['columnFilter'] as IColumnData])

            let data = currentColumn?.data['columnFilter'] as IColumnData;
            setFilterText(data?.filterText)
            setFilterOption(data?.filterOption ?? ColumnOptions.Contains)
        }
    }, [isCalloutVisible]);

    const setFilterTextHandle = (ev: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>, text?: string) => {
        setFilterText(text);
    };

    const setFilterOptionHandle = (ev: React.FormEvent<HTMLDivElement>, dropdownOption?: IDropdownOption) => {
        let t = dropdownOption as { key: string, enumValue: ColumnOptions, text: string };
        setFilterOption(t.enumValue)
    };

    let padding = 8;
    const emojiIcon: IIconProps = { iconName: 'Cancel' }
    const currentColumnType = 
        typeof currentColumn?.data?.type === "object"
        ? (currentColumn?.data?.type as NestedType).type
        : "string"

    return <>
        {
            isCalloutVisible && (
                <Callout
                    gapSpace={0}
                    target={menuTarget}
                    onDismiss={toggleIsCalloutVisible}
                    setInitialFocus
                >
                    <Stack
                        verticalFill
                        horizontalAlign={"space-between"}
                        verticalAlign={"space-between"}
                    >
                        <Stack.Item styles={({ root: { padding: padding } })}>
                            <Stack horizontal
                                horizontalAlign={"space-between"}
                                verticalAlign={"space-between"}
                            >
                                <Stack.Item>
                                    <h3>Filter</h3>
                                </Stack.Item>
                                <Stack.Item>
                                    <IconButton iconProps={emojiIcon} title="Dismiss" ariaLabel="Dismiss"
                                        onClick={toggleIsCalloutVisible} />
                                </Stack.Item>
                            </Stack>
                        </Stack.Item>
                        <Stack horizontal
                            horizontalAlign={"space-between"}
                            verticalAlign={"space-between"}
                        >
                            <Stack.Item styles={({ root: { padding: padding } })}>
                                <DefaultButton text={aToz} onClick={() => {
                                    sortCurrentColumn(ColumnOrder.Up)
                                }} />
                            </Stack.Item>

                            <Stack.Item styles={({ root: { padding: padding } })}>
                                <DefaultButton text={zToa} onClick={() => {
                                    sortCurrentColumn(ColumnOrder.Down)
                                }} />
                            </Stack.Item>
                        </Stack>

                        <Stack.Item styles={({ root: { padding: padding } })}>
                            <Dropdown
                                options={filterOptions}
                                selectedKey={filterOption}
                                onChange={setFilterOptionHandle}
                            />
                        </Stack.Item>

                        <Stack.Item styles={({ root: { padding: padding } })}>
                            {currentColumnType === "string" &&
                                <TextField onChange={setFilterTextHandle} value={filterValue} />
                            }

                            {currentColumnType === "integer" &&
                                <TextField 
                                    type="number" 
                                    onChange={setFilterTextHandle} 
                                    value={filterValue == null ? undefined : ""+filterValue} 
                                />
                            }
                        </Stack.Item>

                        <Stack horizontal={true}>
                            <Stack.Item styles={({ root: { padding: padding } })}>
                                <PrimaryButton text={applyLabel} onClick={applyColumnFilter} />
                            </Stack.Item>
                            <Stack.Item styles={({ root: { padding: padding } })}>
                                <DefaultButton text={clearLabel} onClick={clearColumnFilter} />
                            </Stack.Item>
                        </Stack>

                    </Stack>
                </Callout>
            )
        }
    </>
}
