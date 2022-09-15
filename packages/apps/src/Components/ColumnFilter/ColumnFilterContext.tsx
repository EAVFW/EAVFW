import { AttributeDefinition, getNavigationProperty, isAttributeLookup, ViewDefinition } from "@eavfw/manifest";
import { IColumn, IDetailsColumnProps, IRenderFunction, mergeStyleSets, Target } from "@fluentui/react";
import { useUserProfile } from "../Profile/useUserProfile";
import { IFetchQuery } from "../Views";
import { filterRoles } from "../../filterRoles";
import React, { FC, Reducer } from "react";
import { IColumnData } from "./IColumnData";
import cloneDeep from "clone-deep";
import { ColumnOrder } from "./ColumnOrder";
import { ModelDrivenApp } from "../../ModelDrivenApp";

interface IColumnFilterProps {
    children: any
    view?: ViewDefinition
    attributes: {
        [key: string]: AttributeDefinition
    }
    locale: string
    onHeaderRender?: IRenderFunction<IDetailsColumnProps>
    onBuildFetchQuery: <T>(q: T) => T
    setFetchQuery: (q: IFetchQuery) => void
    currentPage: number
    pageSize: number
    filter?: string
    pagingContextEnabled: boolean
    app: ModelDrivenApp
}


interface IColumnFilterContext {
    menuTarget?: Target,
    isCalloutVisible: boolean,
    currentColumn?: IColumn,
    columns: IColumn[]
}

type ColumnFilterAction =
    {
        type: 'openFilter',
        target: Target,
        column: IColumn
    } |
    {
        type: 'closeFilter'
    } |
    {
        type: 'setCurrentColumnFilter',
        filter?: IColumnData
    } |
    {
        type: 'sortCurrentColumn',
        order: ColumnOrder
    } |
    {
        type: 'initializeColumns',
        view?: ViewDefinition,
        attributes: {
            [key: string]: AttributeDefinition
        },
        locale: string,
        onHeaderRender?: IRenderFunction<IDetailsColumnProps>,
        dispatch: ColumnFilterDispatch
    }

type ColumnFilterDispatch = (action: ColumnFilterAction) => void
const ColumnFilterContext = React.createContext<
    {
        columnFilterState: IColumnFilterContext,
        columnFilterDispatch: ColumnFilterDispatch
    } | undefined>(undefined)

const columnFilterReducer: Reducer<IColumnFilterContext, ColumnFilterAction> = (state, action) => {
    console.log("COLUMN ACTION", [action, state])
    switch (action.type) {
        case "openFilter": return {
            ...state,
            menuTarget: action.target,
            currentColumn: action.column,
            isCalloutVisible: true
        }
        case "closeFilter": return {
            ...state,
            menuTarget: undefined,
            isCalloutVisible: false,
            currentColumn: undefined
        }
        case "setCurrentColumnFilter": {
            const columns = cloneDeep(state.columns)
            const currentColumn = cloneDeep(state.currentColumn)
            if (currentColumn == null) {
                console.log("Trying to set filter without current column")
                return state
            }

            const currentIndex = columns.findIndex(x => x.key === currentColumn.key);
            currentColumn.data['columnFilter'] = action.filter;
            if (action.filter !== undefined) {
                currentColumn.iconName = "Filter";
            } else {
                currentColumn.iconName = undefined;
            }
            columns[currentIndex] = currentColumn;

            return {
                ...state,
                currentColumn,
                columns
            }
        }
        case "sortCurrentColumn": {
            const columns = cloneDeep(state.columns)
            const currentColumn = cloneDeep(state.currentColumn)
            if (currentColumn == null) {
                console.log("Trying to set filter without current column")
                return state
            }

            console.log("Sorting...", [action.order, currentColumn, columns])

            columns.forEach((newCol: IColumn) => {
                const isCurrent = newCol.key === currentColumn.key
                newCol.isSorted = isCurrent
                if (isCurrent) {
                    newCol.isSortedDescending = action.order === ColumnOrder.Down;
                }
            });

            const currentIndex = columns.findIndex(x => x.key === currentColumn.key);
            return {
                ...state,
                columns,
                currentColumn: columns[currentIndex]
            }
        }
        case "initializeColumns": {
            const { view, attributes, locale, dispatch, onHeaderRender } = action
            const user = useUserProfile();
            const columnKeys = Object.keys(view?.columns ?? {}).filter(c => attributes[c] && !(attributes[c].isPrimaryKey ?? false));

            console.log("VIEWS", [attributes, view, columnKeys])
            const columns: Array<IColumn> = columnKeys
                .filter(field => (!view?.columns![field]?.roles) || filterRoles(view.columns![field]?.roles, user))
                .map(column => ({
                    key: column,
                    name: view?.columns![column]?.displayName ?? attributes[column].locale?.[locale ?? "1033"]?.displayName ?? attributes[column].displayName,
                    minWidth: 32,
                    currentWidth: 32,
                    maxWidth: 150,
                    fieldName: attributes[column].logicalName,
                    isResizable: true,
                    isCollapsible: true,
                    data: Object.assign({}, attributes[column], view?.columns?.[column] ?? {}),
                    iconName: columns?.find(x => x.key == column)?.iconName,
                    onColumnClick: (e, c) => dispatch({
                        type: 'openFilter',
                        column: c,
                        target: e.currentTarget
                    }),
                    className: classNames.cell,
                    onRenderHeader: onHeaderRender

                }));
            console.log("Set Columns", [columns]);
            return {
                ...state,
                columns: columns
            }
        }
    }
}

const classNames = mergeStyleSets({
    cell: {
        alignSelf: "center",

    }
});



const ColumnFilterProvider = ({
    children,
    view,
    attributes,
    locale,
    onHeaderRender,
    setFetchQuery,
    currentPage,
    pageSize,
    filter,
    pagingContextEnabled,
    onBuildFetchQuery,
    app
}: IColumnFilterProps) => {
    const [columnFilterState, columnFilterDispatch] = React.useReducer(columnFilterReducer, {
        isCalloutVisible: false,
        columns: []
    })

    const fetchCallBack = React.useCallback(() => {
        const columns = columnFilterState.columns
        console.log("Recalculating fetch qury:", [filter, columns]);
        let expand = Object.values(attributes).filter(isAttributeLookup).map((a) => `${getNavigationProperty(a)}($select=${Object.values(app.getAttributes(app.getEntityFromKey(a.type.referenceType).logicalName)).filter(c => c.isPrimaryField)[0].logicalName})`).join(',');



        //  let q = expand ? `$expand=${expand}` : '';

        let orderBy = columns.filter(c => c.isSorted)[0];



        let localFilters = columns
            .filter(c => (c.data['columnFilter'] as IColumnData)?.odataFilter !== undefined)
            .map(c => {
                let cData = c.data['columnFilter'] as IColumnData;
                return cData.odataFilter;
            });
        let manifestFilter = view?.filter;
        if (manifestFilter) {
            localFilters.push(manifestFilter);
        }

        let localColumnFilter = localFilters.join(" and ");



        let localFilter;
        if (filter && localColumnFilter) {
            localFilter = `${filter} and ${localColumnFilter}`;
        } else if (localColumnFilter) {
            localFilter = `$filter=${localColumnFilter}`;
        } else if (filter) {
            localFilter = filter;
        }
        console.log("Recalculating fetch qury:", localFilter);

        //if (q && localFilter)
        //    q = q + "&" + localFilter;
        //else if (localFilter)
        //    q = localFilter;



        //if (q)
        //    q = '?' + q;

        if (localFilter?.startsWith("$filter="))
            localFilter = localFilter?.substr('$filter='.length);

        const columnAttributes = columns.map(column => column.fieldName)

        let query: IFetchQuery = ({
            "$expand": expand,
            "$filter": localFilter,
            "$select": columnAttributes.join(","),
            '$count': true,
            '$top': pageSize,
            '$skip': currentPage * pageSize
        });

        if (!pagingContextEnabled) {
            delete query['$skip'];
            delete query['$top'];
        }

        if (orderBy) {
            query['$orderby'] = orderBy.fieldName + ' ' + (orderBy.isSortedDescending ? 'desc' : 'asc');
        }

        console.log('Recalculating fetch qury:', [filter, localColumnFilter, query, onBuildFetchQuery(query)])

        setFetchQuery(onBuildFetchQuery(query));


    }, [attributes, columnFilterState.columns, filter, currentPage, pageSize])

    React.useMemo(() => {
        columnFilterDispatch({
            type: 'initializeColumns',
            view: view,
            attributes: attributes,
            locale: locale,
            onHeaderRender: onHeaderRender,
            dispatch: columnFilterDispatch
        })

        fetchCallBack()
    }, [view, attributes, locale])

    return <ColumnFilterContext.Provider value={{ columnFilterState, columnFilterDispatch }}>{children}</ColumnFilterContext.Provider>
}

const useColumnFilter = () => {
    const context = React.useContext(ColumnFilterContext)
    if (context === undefined) {
        throw new Error('useColumnFilter must be used within a ColumnFilterProvider')
    }
    return context
}

export { ColumnFilterProvider, useColumnFilter }
