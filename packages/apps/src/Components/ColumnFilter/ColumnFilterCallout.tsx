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
    TextField,
    Toggle
} from "@fluentui/react";
import React, { useEffect, useMemo, useState } from "react";

import { IColumnData } from "./IColumnData";
import { ColumnOrder } from "./ColumnOrder";
import { ColumnOptions } from "./ColumnOptions";
import { ColumnFilterProps } from "./ColumnFilterProps";
import { AttributeTypeDefinition, isChoice, ChoiceOption, ChoiceType, LookupType, NestedType } from "@eavfw/manifest";
import { useColumnFilter } from "./ColumnFilterContext";
import { ColumnFilterInputType } from "./ColumnFilterInputType";

//function _copyAndSort<T>(items: T[], columnKey: keyof T, isSortedDescending?: boolean): T[] {
//    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[columnKey] < b[columnKey] : a[columnKey] > b[columnKey]) ? 1 : -1));
//}

/**[
 * Composes the OData filter part for the given column, filterText and filterOption.
 * @param filterValue The input for the filter operation
 * @param filterOption contains, startswith, etc.
 * @param columnKey The column key on which the filter is applied
 */
function composeOdataFilterExpression(filterValue: string | number | boolean | undefined, filterOption: ColumnOptions, columnKey?: string) {
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
        case ColumnOptions.Null:
            return `${columnKey} ${ColumnOptions.Null}`
        case ColumnOptions.NotNull:
            return `${columnKey} ${ColumnOptions.NotNull}`
    }
}


/**[
 * Composes the OData filter part for the given column, filterText and filterOption.
 * @param filterValue The input for the filter operation
 * @param filterOption contains, startswith, etc.
 * @param column The column on which the filter is applied
 */
function composeOdataFilterPart(filterValue: string | undefined, filterOption: ColumnOptions, column: IColumn): string | undefined {
    if (typeof (column.data?.type) != "object") return composeOdataFilterExpression(filterValue, filterOption, column.fieldName);
    
    const columnType = column.data?.type as NestedType
    switch (columnType.type?.toLowerCase()) {
        case "text":
        case "string": return composeOdataFilterExpression(filterValue, filterOption, column.fieldName)
        case "boolean": return composeOdataFilterExpression(filterValue === "true", filterOption, column.fieldName)
        case "integer":
        case "decimal":
        case "choice": return composeOdataFilterExpression(filterValue === undefined ? undefined : +filterValue, filterOption, column.fieldName)
        case "polylookup": {
            const lookup = columnType as LookupType;
            console.log("composeOdataFilterPart", [columnType, lookup.foreignKey]);

            if (lookup.foreignKey == null) return composeOdataFilterExpression(filterValue, filterOption, column.fieldName)

            const columnKey = `${lookup.foreignKey.name}`;

            return composeOdataFilterExpression(filterValue, filterOption, columnKey)
        }
        case "lookup": {
           
            const lookup = columnType as LookupType;
            console.log("composeOdataFilterPart", [columnType, lookup.foreignKey]);
            if (lookup.foreignKey == null) return composeOdataFilterExpression(filterValue, filterOption, column.fieldName)

            const columnKey = `${lookup.foreignKey.name}/${lookup.foreignKey.principalNameColumn}`;

            return composeOdataFilterExpression(filterValue, filterOption, columnKey)
        }
    }
}

/**
 * CallOut element giving the possibility to filter columns.
 * @param props
 * @constructor
 */
export const ColumnFilterCallout: React.FC<ColumnFilterProps> = () => {

    const [{ currentColumn, menuTarget,  isCalloutVisible }, columnFilterDispatch ] = useColumnFilter()
    
    const [filterValue, setFilterText] = useState<string>();
    const app = useModelDrivenApp();

    const clearLabel = app.getLocalization('clear') ?? 'Clear';
    const applyLabel = app.getLocalization('apply') ?? 'Apply';
    const to = app.getLocalization('to') ?? 'to';
    const aToz = `A ${to} Z`;
    const zToa = `Z ${to} A`;

    const allfilterOptions = [
        {
            key: ColumnOptions.Contains,
            enumValue: ColumnOptions.Contains,
            text: (app.getLocalization(ColumnOptions.Contains) ?? 'Contains'),
            inputType: ColumnFilterInputType.Single
        },
        {
            key: ColumnOptions.Equals,
            enumValue: ColumnOptions.Equals,
            text: (app.getLocalization(ColumnOptions.Equals) ?? 'Equals'),
            inputType: ColumnFilterInputType.Single
        },
        {
            key: ColumnOptions.EndsWith,
            enumValue: ColumnOptions.EndsWith,
            text: (app.getLocalization(ColumnOptions.EndsWith) ?? 'Ends with'),
            inputType: ColumnFilterInputType.Single
        },
        {
            key: ColumnOptions.StartsWith,
            enumValue: ColumnOptions.StartsWith,
            text: (app.getLocalization(ColumnOptions.StartsWith) ?? 'Starts with'),
            inputType: ColumnFilterInputType.Single
        },
        {
            key: ColumnOptions.Null,
            enumValue: ColumnOptions.Null,
            text: (app.getLocalization(ColumnOptions.Null) ?? 'Empty'),
            inputType: ColumnFilterInputType.None
        },
        {
            key: ColumnOptions.NotNull,
            enumValue: ColumnOptions.NotNull,
            text: (app.getLocalization(ColumnOptions.NotNull) ?? 'Not Empty'),
            inputType: ColumnFilterInputType.None
        }

    ];

    const cancelIcon: IIconProps = { iconName: 'Cancel' }
    const currentColumnType =
        typeof currentColumn?.data?.type === "object"
            ? (currentColumn?.data?.type as NestedType).type
            : "string"

    console.log("currentColumnType", currentColumnType);

    const _currentColumnOptions: () => ColumnOptions[] = () => {
        switch (currentColumnType) {
            case "integer":
            case "decimal":
            case "choice":
            case "choices":
          
            case "boolean":
                return [
                    ColumnOptions.Equals, 
                    ColumnOptions.Null,
                    ColumnOptions.NotNull
                ]
            case "string":
            case "text":
            case "lookup":
            default:
                return [
                    ColumnOptions.Equals, 
                    ColumnOptions.Contains,
                    ColumnOptions.Null,
                    ColumnOptions.NotNull
                ]
        }
    }
    const _currentFilterOptions = () => {
        const currentColumnOptions = _currentColumnOptions()
        return allfilterOptions.filter(x => currentColumnOptions.indexOf(x.key) !== -1)
    }

    const [filterOptions, setFilterOptions] = React.useState(_currentFilterOptions())
    const [filterOption, setFilterOption] = useState(filterOptions[0].key)

    useEffect(() => {
        const newFilterOptions = _currentFilterOptions()
        setFilterOptions(newFilterOptions)
        console.log("COLUMN TYPE CHANGED", [newFilterOptions])
    }, [currentColumnType])

    useEffect(() => {
        setFilterOption(filterOptions[0].key)
    }, [filterOptions])

    const currentFilterOption = filterOptions.filter(x => x.key === filterOption)[0]
    console.log("CUrrent FIlter", currentFilterOption)


    const applyColumnFilter = () => {
        const isFilterValueValid =
            currentFilterOption.inputType === ColumnFilterInputType.None ||
            (filterValue !== undefined && currentFilterOption.inputType === ColumnFilterInputType.Single)

        if (isFilterValueValid && currentColumn !== undefined) {
            console.log("Current column", currentColumn)
            const odataFilterText = composeOdataFilterPart(filterValue, filterOption, currentColumn); 
            const data: IColumnData = { filterText: filterValue, odataFilter: odataFilterText, filterOption: filterOption }
            console.log("Applying Filter Values", data);
            columnFilterDispatch({
                type: 'setCurrentColumnFilter',
                filter: data
            });
        }
    }

    const clearColumnFilter = () => {
        columnFilterDispatch({
            type: 'setCurrentColumnFilter',
            filter: undefined
        })

        columnFilterDispatch({
            type: 'closeFilter'
        })
    }

    const sortCurrentColumn = (order: ColumnOrder) => {
        columnFilterDispatch({
            type: 'sortCurrentColumn',
            order: order
        })
    };

    const currentColumnInput = () => {
        switch (currentColumnType) {
            case "integer":
            case "decimal":
                return <TextField
                    type="number"
                    onChange={setFilterTextHandle}
                    value={filterValue == null ? undefined : "" + filterValue}
                />
            case "choice":
            case "choices": {
                const data = currentColumn?.data.type as ChoiceType
                const options = data.options ?? {}
                const optionValues = Object.entries(options)
                const fluentUIOptions: IDropdownOption<number>[] = optionValues
                    .map(([key, option]) => {
                        let value: number = -1
                        let text: string = ""

                        if (typeof option === "object") {
                            value = option.value
                            text = option.locale == null ? "" : option.locale[app.locale].displayName
                        } else {
                            value = option
                            text = key
                        }

                        return {
                            key: value,
                            text: text,
                            selected: filterValue === "" + value,
                            data: value,
                            ariaLabel: text,
                            index: value,
                            title: text
                        }
                    })

                return <Dropdown
                    options={fluentUIOptions}
                    onChange={(ev, value) =>
                        setFilterTextHandle(ev, value?.key == null ? "" : "" + value.key)}
                    multiSelect={currentColumnType === "choices"}
                />
            }
            case "boolean": {
                return <Toggle
                    defaultValue={filterValue}
                    onChange={(ev,checked) => setFilterTextHandle(ev,`${checked}`)}
                />
            }
            case "string":
            case "text":
            case "lookup":
            default: return <TextField onChange={setFilterTextHandle} value={filterValue} />
        }
    }

    // Load saved filter data
    useEffect(() => {
        if (isCalloutVisible) {
            console.log("toggleColumn", ["triggered", currentColumn?.data['columnFilter'] as IColumnData])

            let data = currentColumn?.data['columnFilter'] as IColumnData;
            setFilterText(data?.filterText)
            setFilterOption(data?.filterOption ?? ColumnOptions.Contains)
        }
    }, [isCalloutVisible]);

    const setFilterTextHandle = (ev: React.SyntheticEvent<HTMLElement>, text?: string) => {
        setFilterText(text);
    };

    const setFilterOptionHandle = (ev: React.FormEvent<HTMLDivElement>, dropdownOption?: IDropdownOption) => {
        let t = dropdownOption as { key: string, enumValue: ColumnOptions, text: string };
        setFilterOption(t.enumValue)
    };

    let padding = 8;
    return <>
        {
            isCalloutVisible && (
                <Callout
                    gapSpace={0}
                    target={menuTarget}
                    onDismiss={() => columnFilterDispatch({ type: 'closeFilter' })}
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
                                    <IconButton iconProps={cancelIcon} title="Dismiss" ariaLabel="Dismiss"
                                        onClick={() => columnFilterDispatch({ type: 'closeFilter' })} />
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

                        {<Stack.Item styles={({ root: { padding: padding } })}>
                            <Dropdown
                                options={filterOptions}
                                selectedKey={filterOption}
                                onChange={setFilterOptionHandle}
                            />
                        </Stack.Item>}

                        <Stack.Item styles={({ root: { padding: padding } })}>
                            {currentFilterOption?.inputType === ColumnFilterInputType.Single && currentColumnInput()}
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
