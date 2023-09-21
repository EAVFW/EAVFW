import { AttributeDefinition, getNavigationProperty, isAttributeLookup, isPolyLookup, LookupAttributeDefinition, LookupType, ViewDefinition } from "@eavfw/manifest";
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
        app: ModelDrivenApp,
        attributes: {
            [key: string]: AttributeDefinition
        },
        locale: string,
        onHeaderRender?: IRenderFunction<IDetailsColumnProps>,
        dispatch: ColumnFilterDispatch
    }

type ColumnFilterDispatch = (action: ColumnFilterAction) => void
const ColumnFilterContext = React.createContext<
    [
        columnFilterState: IColumnFilterContext,
        columnFilterDispatch: ColumnFilterDispatch
    ] | undefined>(undefined)

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
            const { view, attributes, locale, dispatch, onHeaderRender, app } = action
            const user = useUserProfile();


            const columnKeys = Object.keys(view?.columns ?? {}).filter(c => c.indexOf('/') || (attributes[c] && !(attributes[c].isPrimaryKey ?? false)));


            function columnDisplayName(column:string) {

                if (column.indexOf('/') !== -1) {
                    var parts = column.split('/');
                    var navAttributes = attributes;
                    var nav = column;
                    while (parts.length)
                    {
                        nav = parts.shift()!;
                        var lookup = navAttributes[nav];
                        if (lookup && isAttributeLookup(lookup)) {
                            var entity = app.getEntityFromKey(lookup.type.referenceType);

                            if (parts.length === 0)
                                return entity.locale?.[locale ?? "1033"]?.displayName ?? entity.displayName;


                            navAttributes = entity.attributes;
                            nav = Object.entries(navAttributes).filter(a => a[1].isPrimaryField)[0]?.[0];
                        } else {
                            break;
                        }
                        
                    }
                    console.log("View with Parts", [view, column, nav, navAttributes, parts]);
                    return  navAttributes[nav].locale?.[locale ?? "1033"]?.displayName ?? navAttributes[nav].displayName;
                }
                if (!(column in attributes))
                    throw new Error(`The ${column} does not exists`);
             
                return attributes[column].locale?.[locale ?? "1033"]?.displayName ?? attributes[column].displayName
            }


            console.log("VIEWS", [attributes, view, columnKeys])
            const columns: Array<IColumn> = columnKeys
                /*.filter(field => view?.columns![field]?.visible !== false)*/
                .filter(field => (!view?.columns![field]?.roles) || filterRoles(view.columns![field]?.roles, user))
                .map(column => ({
                    key: column,
                    name: view?.columns![column]?.displayName ?? columnDisplayName(column),
                    minWidth: 32,                    
                    currentWidth: 32,
                    maxWidth: 150,
                    fieldName: attributes[column]?.logicalName,
                    isResizable: true,
                    isCollapsible: true,
                    isSorted: typeof view?.columns![column]?.sorted !== "undefined",
                    isSortedDescending: view?.columns![column]?.sorted === "descending",
                    data: Object.assign({}, attributes[column], view?.columns?.[column] ?? {}),
                    iconName: view?.columns![column]?.iconName ?? attributes[column]?.iconName, //columns?.find(x => x.key == column)?.iconName,
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
type AttributeDefinitionEntry = [string, AttributeDefinition];
type LookupAttributeDefinitionEntry = [string, LookupAttributeDefinition];
export function isAttributeLookupEntry(entry: AttributeDefinitionEntry): entry is LookupAttributeDefinitionEntry {
    const [key, attribute] = entry;
    const type = typeof attribute.type === "string" ? attribute.type : attribute.type?.type; // getAttributeType(attribute);
    return type === "lookup" || type === "polylookup";
}

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

    const columnAttributes = React.useMemo(() => {
        const columns =
            Object.keys(view?.columns ?? {})
                .filter(c => attributes[c] && (!attributes[c].isPrimaryKey))
                .map(c => attributes[c].logicalName);

        if (columns.length === 0) return [];

        const keys = 
            Object.values(attributes)
            .filter(a => a.isPrimaryKey || a.isRowVersion)
            .map(c => c.logicalName);

        return columns.concat(keys);
    }, [view, attributes]);


    React.useEffect(() => {
        const { columns} = columnFilterState
        console.log("Recalculating fetch qury:", [filter, columns, attributes]);

        function expandPolyLookup(key:string,attr: AttributeDefinition) {
            let type = attr.type;

       

            if (isPolyLookup(type)) {
                console.log("Polylookup", [type]);

                let expands = (type.inline ? type.referenceTypes : [type.referenceType]).map(referenceType => Object.values(app.getAttributes(app.getEntityFromKey(referenceType).logicalName))
                    .filter(isAttributeLookup)
                    .map(a => `${getNavigationProperty(a)}($select=${Object.values(app.getAttributes(app.getEntityFromKey(a.type.referenceType).logicalName)).filter(c => c.isPrimaryField)[0].logicalName})`));
                console.log("Polylookup", expands);
                return  `$expand=${expands.join(',')};`
            } else if (isAttributeLookup(attr)) {

                let a = [...new Set(columns.filter(f => f.key.split('/')[0]===key && f.key !== key).map(c => c.key.split('/')[1]))]
                    .map(nav => app.getEntityFromKey(attr.type.referenceType).attributes[nav].schemaName.slice(0,-2));

                if (a.length) {
                    return `$expand=${a.join(',')};`
                }


            }

            //return [];
            return '';
        }

        function selectPolyLookup(attr: AttributeDefinition) {
            let type = attr.type;
            if (isPolyLookup(type)) {

                var selects=Object.values(app.getAttributes(app.getEntityFromKey(type.referenceType).logicalName))
                    .filter(isAttributeLookup)
                    .map(a => a.logicalName);
                return ','+ selects.join(',');

            }
            return '';
        }

        function getPrimaryField(referenceType: string) {
            
            return Object.values(app.getAttributes(app.getEntityFromKey(referenceType).logicalName)).filter(c => c.isPrimaryField)[0].logicalName;
        }

        

        let expand = columns.filter(x => x.key in attributes)
            .map(x => [x.key, attributes[x.key]] as [string, AttributeDefinition])
            .filter(isAttributeLookupEntry)
            .map(([key, a]) => a.type.inline ? `${a.type.referenceTypes?.map(referenceType => `${app.getEntityFromKey(referenceType).logicalName}($select=${getPrimaryField(referenceType)})`).join(',')}` : `${getNavigationProperty(a)}(${expandPolyLookup(key, a)}$select=${getPrimaryField(a.type.referenceType)}${selectPolyLookup(a)})`);

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
        console.log("Recalculating fetch qury:", [localColumnFilter,localFilters,filter,localFilter]);

        if (localFilter?.startsWith("$filter="))
            localFilter = localFilter?.substr('$filter='.length);

        let query: IFetchQuery = ({
            "$expand": expand.join(','),
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
    }, [attributes, columnFilterState.columns, filter, currentPage, pageSize, columnAttributes])

    React.useMemo(() => {
        console.log("Calling reducer from memo");
        columnFilterDispatch({
            type: 'initializeColumns',
            view: view ?? { columns: { ...Object.fromEntries(Object.keys(attributes).map(column => [column, {}])) } },
            app:app,
            attributes: attributes,
            locale: locale,
            onHeaderRender: onHeaderRender,
            dispatch: columnFilterDispatch
        })
    }, [view, attributes, locale])
    
    return <ColumnFilterContext.Provider value={[columnFilterState, columnFilterDispatch ]}>{children}</ColumnFilterContext.Provider>
}

const useColumnFilter = () => {
    const context = React.useContext(ColumnFilterContext)
    if (context === undefined) {
        throw new Error('useColumnFilter must be used within a ColumnFilterProvider')
    }
    return context
}

export { ColumnFilterProvider, useColumnFilter }
