import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Stack,
    Selection,
    SelectionMode,
    IColumn,
    ICommandBarItemProps,
    IDropdownOption,
    IRenderFunction,
    IDetailsListProps,
    IObjectWithKey,
    IDetailsColumnProps,
} from "@fluentui/react";
import {
    EntityDefinition,
    IRecord,
    queryEntitySWR,
} from "@eavfw/manifest";
import { useRibbon } from "../../Ribbon/useRibbon";
import { useProgressBarContext } from "../../ProgressBar/ProgressBarContext";
import { useModelDrivenApp } from "../../../useModelDrivenApp";
import {
    ColumnFilterProvider,
} from "../../ColumnFilter/ColumnFilterContext";
import { useSelectionContext } from "../../Selection/useSelectionContext";
import { ColumnFilterCallout } from "../../ColumnFilter/ColumnFilterCallout";
import { RibbonBar } from "../../Ribbon/RibbonBar";
import { useAppInfo } from "../../../useAppInfo";
import { useLazyMemo } from "@eavfw/hooks";
import { IFetchQuery, usePaging } from "../PagingContext";
import styles from "./ModelDrivenGridViewer.module.scss";
import ModelDrivenList from "../ModelDrivenList/ModelDrivenList";
import { ConditionRenderComponent } from "./Components/ConditionRenderComponent";
import { RenderDetailsFooter } from "./Components/RenderDetailsFooter";

export type ModelDrivenGridViewerState = {
    columns: IColumn[];
    items: IRecord[];
    selectionDetails: string;
    isModalSelection: boolean;
    isCompactMode: boolean;
    announcedMessage?: string;
    showViewSelector: boolean;
    showRibbonBar: boolean;
    padding: number;
    views: IDropdownOption[];
    selectedView: string;
    loaded: boolean;
    commands: ICommandBarItemProps[];
};

export type ModelDrivenGridViewerProps = {
    allowNoPaging?: boolean;
    defaultValues?: Array<any>;
    viewName?: string;
    filter?: string;
    newRecord?: boolean;
    entityName?: string;
    entity: EntityDefinition;
    locale: string;
    showViewSelector?: boolean;
    showRibbonBar?: boolean;
    padding?: number;
    rightCommands?: ICommandBarItemProps[];
    commands?: (ctx: {
        selection: Selection<Partial<IRecord> & IObjectWithKey>;
    }) => ICommandBarItemProps[];
    recordRouteGenerator: (record: IRecord) => string;
    listComponent?: React.ComponentType<
        IDetailsListProps & { formData: any; onChange?: (related: any) => void }
    >;
    onChange?: (data: any) => void;
    formData?: any;
    onHeaderRender?: IRenderFunction<IDetailsColumnProps>;
    onBuildFetchQuery?: <T>(q: T) => T;
    onQueueData?: typeof DefaultDataQuery;
    onQueryDataCount?: typeof DefaultDataCountQuery;
};

const DefaultOnBuildFetchQuery = (q: any) => q;

export function ModelDrivenGridViewer({
    allowNoPaging,
    locale,
    entity,
    filter,
    onChange,
    formData,
    showViewSelector = true,
    newRecord,
    showRibbonBar,
    commands,
    rightCommands,
    viewName,
    recordRouteGenerator,
    padding,
    entityName,
    defaultValues,
    onHeaderRender,
    onBuildFetchQuery = DefaultOnBuildFetchQuery,
    onQueueData = DefaultDataQuery,
    onQueryDataCount = DefaultDataCountQuery
}: ModelDrivenGridViewerProps) {
    const app = useModelDrivenApp();
    const appinfo = useAppInfo();
    const { buttons, addButton, removeButton, events } = useRibbon();
    const { hideProgressBar, showIndeterminateProgressIndicator } = useProgressBarContext();

    const [items, setItems] = useState<IRecord[]>(
        newRecord ? formData[entity.collectionSchemaName.toLowerCase()] ?? [] : []
    );
    const selectedView = useMemo(
        () => viewName ?? Object.keys(entity.views ?? {})[0],
        [viewName]
    );
    const attributes = useMemo(
        () => ({
            ...((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}),
            ...entity.attributes,
        }),
        [entityName]
    );
    const viewDefinition = useMemo(
        () => entity.views?.[selectedView],
        [selectedView]
    );
    const [isModalSelection, setisModalSelection] = useState(
        entity.views?.[selectedView]?.selection !== false
    );
    const { selection, selectionDetails } = useSelectionContext();

    const stateCommands = useLazyMemo<ModelDrivenGridViewerState["commands"]>(
        () => commands?.({ selection }) ?? rightCommands ?? [],
        [
            commands,
            selection,
            selectionDetails,
            appinfo.currentEntityName,
            appinfo.currentRecordId,
        ]
    );
    useEffect(() => {
        stateCommands.forEach(addButton);
        return () => stateCommands.forEach(cmd => removeButton(cmd.key));
    }, [stateCommands]);


    const {
        fetchQuery,
        setFetchQuery,
        pageSize,
        currentPage,
        setTotalRecords,
        enabled: pagingContextEnabled,
    } = usePaging();
    const pagingDisabled = useMemo(
        () =>
            viewDefinition?.paging === false ||
            (typeof viewDefinition?.paging === "object" &&
                viewDefinition?.paging?.enabled === false),
        [viewDefinition]
    );

    if (!pagingContextEnabled && !(allowNoPaging || pagingDisabled))
        throw new Error(
            `Please wrap ModelDrivenEntityViewer with the PagingProvider or set allowNoPaging=true: pagingContextEnabled=${pagingContextEnabled}, allowNoPaging=${allowNoPaging}, pagingDisabled=${pagingDisabled}`
        );

    console.log("Render FetchQuery", [viewDefinition, fetchQuery]);
    if (fetchQuery) {
        fetchQuery["$count"] = false;
    }
    const { data, isError, isLoading, mutate } = onQueueData(
        entity,
        newRecord,
        fetchQuery,

    );
    const { data: count } = onQueryDataCount(
        entity,
        newRecord,
        fetchQuery
    );

    useEffect(() => {
        mutate();
    }, [formData?.modifiedon]);

    //Show loading bar based on loading from data.
    useEffect(() => {
        if (isLoading && !newRecord) showIndeterminateProgressIndicator();
        else {
            hideProgressBar();
        }
        return () => {
            hideProgressBar();
        };
    }, [isLoading, isError]);

    //Set items whenever its done loading and augment with entityName.
    useEffect(() => {
        console.log("setItems from data", [
            data,
            isLoading,
            defaultValues,
            fetchQuery,
        ]);

        if (data)
            setItems(
                data.items.map((item) =>
                    Object.assign(item, { entityName: entity.logicalName })
                )
            );

        if (newRecord && defaultValues) {
            setItems(
                defaultValues.map((item) =>
                    Object.assign(item, { entityName: entity.logicalName })
                )
            );
        }
    }, [data, newRecord && defaultValues]);

    useEffect(() => {
        setTotalRecords(count?.count ?? -1);
    }, [count?.count]);

    // const hasMoreViews = Object.keys(entity?.views ?? {}).length > 1;

    const _onItemInvoked = (item: IRecord): void => {
        window.location.href = recordRouteGenerator(item);
    };

    return (
        <Stack verticalFill>
            <ColumnFilterProvider
                view={viewDefinition}
                filter={filter}
                attributes={attributes}
                locale={locale}
                onHeaderRender={onHeaderRender}
                onBuildFetchQuery={onBuildFetchQuery}
                setFetchQuery={setFetchQuery}
                currentPage={currentPage}
                pageSize={pageSize}
                pagingContextEnabled={pagingContextEnabled}
                app={app}
            >
                <ColumnFilterCallout />

                <Stack.Item
                    className={styles.gridviewWrapper}
                    grow
                    styles={{ root: { padding: padding } }}
                >
                    {showRibbonBar && stateCommands.length > 0 && <RibbonBar hideBack />}

                    <ModelDrivenList
                        className={isModalSelection ? "gridview" : ""}
                        items={items}
                        selectionMode={isModalSelection ? SelectionMode.multiple : SelectionMode.none}
                        setKey={isModalSelection ? "multiple" : "none"}
                        onChange={onChange}
                        formData={formData}
                        onRenderItemColumn={(item, index, column) => (
                            <ConditionRenderComponent
                                key={"ConditionRenderComponent: " + index}
                                entity={entity}
                                recordRouteGenerator={recordRouteGenerator}
                                item={item}
                                index={index}
                                column={column}
                                setItems={setItems}
                                formName={Object.keys(entity.forms ?? {})[0]}
                                attribute={app.getAttribute(attributes, column?.key!)}
                                items={items}
                                locale={locale}
                            />
                        )}
                        onItemInvoked={_onItemInvoked}
                        onRenderDetailsFooter={
                            pagingDisabled || !pagingContextEnabled
                                ? undefined
                                : RenderDetailsFooter
                        }
                    />
                </Stack.Item>
            </ColumnFilterProvider>
        </Stack>
    );
}

export default ModelDrivenGridViewer;


export const DefaultDataQuery = (entity: EntityDefinition, newRecord?: boolean, fetchQuery?: IFetchQuery) => {
    return queryEntitySWR(
        entity,
        setCount(fetchQuery, false),
        !newRecord && typeof fetchQuery !== "undefined"
    );
}
export const DefaultDataCountQuery = (entity: EntityDefinition, newRecord?: boolean, fetchQuery?: IFetchQuery) => {
    return queryEntitySWR(
        entity,
        setSkip(setTop(setCount(fetchQuery, true), 0), 0),
        !newRecord && typeof fetchQuery !== "undefined"
    );
}

export function setCount(fetchQuery?: IFetchQuery, count = true) {
    if (fetchQuery) {
        let clone = { ...fetchQuery } as IFetchQuery;
        if (clone["$count"] !== count) {
            clone["$count"] = count;
            return clone;
        }
    }
    return fetchQuery;
}
export function setTop(fetchQuery?: IFetchQuery, top = 100) {
    if (fetchQuery) {
        let clone = { ...fetchQuery } as IFetchQuery;
        if (clone["$top"] !== top) {
            clone["$top"] = top;
            return clone;
        }
    }
    return fetchQuery;
}
export function setSkip(fetchQuery?: IFetchQuery, skip = 0) {
    if (fetchQuery) {
        let clone = { ...fetchQuery } as IFetchQuery;
        if (clone["$skip"] !== skip) {
            clone["$skip"] = skip;
            return clone;
        }
    }
    return fetchQuery;
}




// export interface IScrollablePaneDetailsListExampleItem {
//     key: number | string;
//     name: string;
//     test2: string;
//     test3: string;
//     test4: string;
//     test5: string;
//     test6: string;
// }



// const footerItem: IScrollablePaneDetailsListExampleItem = {
//     key: "footer",
//     name: "Footer 1",
//     test2: "Footer 2",
//     test3: "Footer 3",
//     test4: "Footer 4",
//     test5: "Footer 5",
//     test6: "Footer 6",
// };

// const RibbonStyles: IStackStyles = {
//     root: {
//         overflow: "hidden",
//         width: `100%`,
//         borderBottom: "solid 0.5px white",
//     },
// };
// const leftribbon: ICommandBarStyles = {
//     root: {
//         padding: 0,
//         margin: 0,
//     },
// };

// const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (
//     props,
//     defaultRender
// ) => {
//     if (!props) {
//         return null;
//     }
//     const onRenderColumnHeaderTooltip: IRenderFunction<
//         IDetailsColumnRenderTooltipProps
//     > = (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />;
//     return (
//         <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced>
//             {defaultRender!({
//                 ...props,
//                 styles: {
//                     root: { paddingTop: 0 },
//                 },
//                 onRenderColumnHeaderTooltip,
//             })}
//         </Sticky>
//     );
// };

// const classNames = mergeStyleSets({
//     wrapper: {
//         height: "80vh",
//         position: "relative",
//         backgroundColor: "white",
//     },
//     filter: {
//         backgroundColor: "white",
//         paddingBottom: 20,
//         maxWidth: 300,
//     },
//     header: {
//         margin: 0,
//         backgroundColor: "white",
//     },
//     row: {
//         display: "inline-block",
//     },
//     cell: {
//         alignSelf: "center",
//     },
// });



// function _getKey(item: any, index?: number): string {
//     return item.key;
// }