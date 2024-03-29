import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
    Stack,
    DetailsList,
    DetailsListLayoutMode,
    Selection,
    SelectionMode,
    IColumn,
    IStackStyles,
    CommandBar,
    ICommandBarStyles,
    ICommandBarItemProps,
    IDropdownOption,
    IDetailsFooterProps,
    IRenderFunction,
    StickyPositionType,
    IDetailsHeaderProps,
    IDetailsColumnRenderTooltipProps,
    TooltipHost,
    Sticky,
    DetailsRow,
    mergeStyleSets,
    IDetailsRowStyles,
    IDetailsListProps,
    getTheme,
    ConstrainMode,
    Modal,
    IObjectWithKey,
    MessageBar,
    MessageBarType,
    IDetailsColumnProps,
    useTheme,
    IconButton,
    DetailsHeader,
} from "@fluentui/react";
import { FormValidation, FieldValidation } from "@rjsf/core";


import Link from 'next/link';

import { useBoolean, useId } from "@fluentui/react-hooks"


import { AttributeDefinition, EntityDefinition, getNavigationProperty, IRecord, isAttributeLookup, isLookup, LookupAttributeDefinition, LookupType, queryEntitySWR, ViewColumnDefinition, ViewDefinition } from '@eavfw/manifest';
import { FormRenderProps } from '../Forms/FormRenderProps';
import { useRibbon } from '../Ribbon/useRibbon';
import { errorMessageFactory, useMessageContext } from '../MessageArea/MessageContext';
import { useProgressBarContext } from '../ProgressBar/ProgressBarContext';
import { handleValidationErrors } from '../../Validation/handleValidationErrors';
import { LazyFormRender } from '../Forms/LazyFormRender';
import { useModelDrivenApp } from '../../useModelDrivenApp';
import { ColumnFilterProvider, useColumnFilter } from '../ColumnFilter/ColumnFilterContext';
import { useSelectionContext } from '../Selection/useSelectionContext';
import { IColumnData } from '../ColumnFilter/IColumnData';
import { useUserProfile } from '../Profile/useUserProfile';
import { RibbonHost } from '../Ribbon/RibbonHost';
import { ColumnFilterCallout } from '../ColumnFilter/ColumnFilterCallout';
import { RibbonBar } from '../Ribbon/RibbonBar';
import { filterRoles } from '../../filterRoles';
import { useAppInfo } from '../../useAppInfo';
import { useLazyMemo } from '../../../../hooks/src';
import { Controls } from '../Controls/ControlRegister';
import { IFetchQuery, usePaging } from './PagingContext';
import styles from "./ModelDrivenGridViewer.module.scss";
import ModelDrivenList from './ModelDrivenList';

//const theme = getTheme();

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
    commands: ICommandBarItemProps[],
}

export type ModelDrivenGridViewerProps = {
    allowNoPaging?: boolean,
    defaultValues?: Array<any>
    viewName?: string;
    filter?: string;
    newRecord?: boolean;
    entityName?: string;
    entity: EntityDefinition;
    locale: string;
    showViewSelector?: boolean;
    showRibbonBar?: boolean;
    padding?: number;
    rightCommands?: ICommandBarItemProps[],
    commands?: (ctx: { selection: Selection<Partial<IRecord> & IObjectWithKey> }) => ICommandBarItemProps[],
    recordRouteGenerator: (record: IRecord) => string;
    listComponent?: React.ComponentType<IDetailsListProps & { formData: any, onChange?: (related: any) => void }>
    onChange?: (data: any) => void
    formData?: any;
    onHeaderRender?: IRenderFunction<IDetailsColumnProps>
    onBuildFetchQuery?: <T>(q: T) => T;
}

const RibbonStyles: IStackStyles = {
    root: {
        overflow: 'hidden',
        width: `100%`,
        borderBottom: "solid 0.5px white"
    },
};
const leftribbon: ICommandBarStyles = {
    root: {
        padding: 0,
        margin: 0,
    },
};

export interface IScrollablePaneDetailsListExampleItem {
    key: number | string;
    name: string;
    test2: string;
    test3: string;
    test4: string;
    test5: string;
    test6: string;
}

const footerItem: IScrollablePaneDetailsListExampleItem = {
    key: 'footer',
    name: 'Footer 1',
    test2: 'Footer 2',
    test3: 'Footer 3',
    test4: 'Footer 4',
    test5: 'Footer 5',
    test6: 'Footer 6',
};

const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (props, defaultRender) => {
    if (!props) {
        return null;
    }
    const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> = tooltipHostProps => (
        <TooltipHost {...tooltipHostProps} />
    );
    return (
        <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced>
            {defaultRender!({
                ...props, styles: {
                    root: { paddingTop: 0 }
                },
                onRenderColumnHeaderTooltip,
            })}
        </Sticky>
    );
};

const classNames = mergeStyleSets({
    wrapper: {
        height: '80vh',
        position: 'relative',
        backgroundColor: 'white',
    },
    filter: {
        backgroundColor: 'white',
        paddingBottom: 20,
        maxWidth: 300,
    },
    header: {
        margin: 0,
        backgroundColor: 'white',
    },
    row: {
        display: 'inline-block',
    },
    cell: {
        alignSelf: "center",

    }
});


const RenderDetailsFooter: IRenderFunction<IDetailsFooterProps> = (props, defaultRender) => {
    if (!props) {
        return null;
    }

    const { currentPage, firstItemNumber, lastItemNumber, pageSize, totalRecords, moveToFirst, moveNext, movePrevious } = usePaging();
    const { selectedCount } = { selectedCount: 0 };

    return (
        <Stack grow horizontal horizontalAlign="space-between" >
            <Stack.Item grow className="Footer" align='end'>
                <Stack grow horizontal horizontalAlign="space-between">
                    <Stack.Item grow={1} align="center">{firstItemNumber} - {lastItemNumber} of {totalRecords} ({selectedCount} selected)</Stack.Item>
                    <Stack.Item align="center" className="FooterRight">
                        <Stack grow horizontal verticalAlign='center'>
                            <IconButton className="FooterIcon" iconProps={{ iconName: "DoubleChevronLeft" }} onClick={moveToFirst} />
                            <IconButton className="FooterIcon" iconProps={{ iconName: "ChevronLeft" }} onClick={movePrevious} />
                            <span style={{ display: "block" }}>Page {currentPage + 1}</span>
                            <IconButton className="FooterIcon" iconProps={{ iconName: "ChevronRight" }} onClick={moveNext} />
                        </Stack>
                    </Stack.Item>
                </Stack>
            </Stack.Item>
        </Stack>
    );
};

type LookupControlRenderProps = {
    recordRouteGenerator: any;
    item: any;
    attribute: AttributeDefinition;
    type: LookupType;
    onChange?: any;
}

const LookupControlRender: React.FC<LookupControlRenderProps> = ({ item, attribute, type, recordRouteGenerator, onChange }) => {


    const [isOpen, { setFalse, setTrue }] = useBoolean(false);
    const save = useRibbon();
    const app = useModelDrivenApp();

    const recordRef = useRef<any>(item[attribute.logicalName.slice(0, -2)]);
    const _onDataChange = useCallback((data: any) => {
        console.log("LookupControlRender-OnDataChange", data);
        recordRef.current = data;
    }, []);

    const [extraErrors, setExtraErrors] = useState({} as FormValidation);
    const entitySaveMessageKey = 'entitySaved';
    const { addMessage, removeMessage } = useMessageContext();
    const { showIndeterminateProgressIndicator, hideProgressBar } = useProgressBarContext();

    let entity = app.getEntity(type.foreignKey?.principalTable!);
    const attributes = useMemo(() => ({ ...((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}), ...entity.attributes }), [entity.logicalName]);

    const _onModalDismiss = useCallback(async (data: any) => {

        console.log(data);
        setFalse();
        if (data === "save") {

            showIndeterminateProgressIndicator();


            let plain = Object.fromEntries(Object.values(attributes).map(v => [v.logicalName, recordRef.current[v.logicalName]]));
            let rsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}/records/${recordRef.current.id}`, {
                method: "PATCH",
                body: JSON.stringify(plain),
                credentials: "include"
            });

            if (rsp.ok) {
                for (let k of Object.keys(plain)) {
                    item[attribute.logicalName.slice(0, -2)][k] = plain[k];
                }

                if (onChange)
                    onChange(item);

                addMessage(entitySaveMessageKey, (props?: any) =>
                    <MessageBar messageBarType={MessageBarType.success} {...props}
                        onDismiss={() => removeMessage(entitySaveMessageKey)}>
                        {app.getLocalization('entitySaved') ?? <>Entity have been saved!</>}
                    </MessageBar>);
            } else {

                const { errors, extraErrors } = await handleValidationErrors(rsp, app);

                setExtraErrors(extraErrors);

                addMessage(entitySaveMessageKey, errorMessageFactory({
                    key: entitySaveMessageKey,
                    removeMessage: removeMessage, messages: errors
                }));


            }

            hideProgressBar();
        }

    }, []);

    const _onClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (save.canSave) {
            const _once = () => {
                save.events.off("saveComplete", _once);
                setTrue();
            }
            save.events.on("saveComplete", _once);
            save.events.emit("onSave");
        } else {
            setTrue();
        }
        return false;
    }

    return <>
        <Modal isOpen={isOpen} onDismiss={setFalse} isBlocking={true}>
            <Stack verticalFill styles={{ root: { minWidth: "60vw", maxWidth: "90vw" } }}>
                <Stack horizontal>
                    <Stack.Item grow>
                        <CommandBar id="ModalRibbonBarCommands"
                            items={[]}
                            farItems={[{
                                key: 'close',
                                ariaLabel: 'Info',
                                iconOnly: true,
                                iconProps: { iconName: 'Cancel' },
                                onClick: setFalse,
                            }]}
                            ariaLabel="Use left and right arrow keys to navigate between commands"
                        />
                    </Stack.Item>
                </Stack>

                <LazyFormRender extraErrors={extraErrors} record={recordRef.current} entityName={type.foreignKey?.principalTable}
                    dismissPanel={_onModalDismiss} onChange={_onDataChange} />

            </Stack>
        </Modal>
        <a href="#"
            onClick={_onClick}>{(item[attribute.logicalName.endsWith("id") ? attribute.logicalName.slice(0, -2) : attribute.logicalName][type.foreignKey?.principalNameColumn?.toLowerCase()!]) ?? '<ingen navn>'}</a>
        { }
    </>
}

function _getKey(item: any, index?: number): string {
    return item.key;
}



const getCellText = (item: any, column: IColumn): string => {
    let value = item && column && column.fieldName ? item[column.fieldName] : '';

    if (value === null || value === undefined) {
        value = '';
    }

    if (typeof value === 'boolean') {
        return value.toString();
    }

    return value;
};



const ConditionRenderComponent: React.FC<any> = (
    {
        recordRouteGenerator,
        item,
        index,
        column,
        setItems,
        attribute,
        items,
        locale
    }) => {

    const { onRenderPrimaryField: RenderPrimaryField } = useModelDrivenGridViewerContext();
    const type = attribute.type;

    if (typeof type === "object" && type.type === "choice" && type.options && item) {
        const value = item[column?.fieldName as string];

        if (value || value === 0) {

            const [key, optionValue] = Object.entries<any>(type.options).filter(([key, value]) => (typeof value === "number" ? value : value.value) === item[column?.fieldName as string])[0];
            return <>{optionValue?.locale?.[locale]?.displayName ?? optionValue?.text ?? key}</>;
        }
        return null;

    } else if (attribute.isPrimaryField) {

        return <RenderPrimaryField recordRouteGenerator={recordRouteGenerator} item={item} column={column} />
        //        return <Link href={recordRouteGenerator(item)}><a>{item[column?.fieldName!] ?? '<ingen navn>'}</a></Link>

    } else if (isLookup(type) && item[attribute.logicalName]) {
        console.log(item);
        console.log(item[attribute.logicalName.slice(0, -2)][type.foreignKey?.principalNameColumn?.toLowerCase()!]);
        console.log(item[attribute.logicalName.slice(0, -2)][type.foreignKey?.principalNameColumn?.toLowerCase()!]?.length);
        console.log(item[attribute.logicalName.slice(0, -2)][type.foreignKey?.principalNameColumn?.toLowerCase()!]?.trim()?.length);
        //TODO - Add Toggle in manifest to use hyperlink vs modal
        return <Link legacyBehavior={true} href={recordRouteGenerator({ id: item[attribute.logicalName], entityName: item[attribute.logicalName.slice(0, -2)]?.["$type"] ?? type.foreignKey?.principalTable! })} >
           
            <a>{item[attribute.logicalName.slice(0, -2)][type.foreignKey?.principalNameColumn?.toLowerCase()!]}</a>
             
        </Link>

        return <LookupControlRender onChange={(data: any) => {
            console.log("Lookup data returned", [data, item]);
            console.log("LookupControlRender change", [item, index, column, data, JSON.stringify(items)]);

            setItems(items.slice());
        }} type={type} attribute={attribute} item={item} recordRouteGenerator={recordRouteGenerator} />
    } else if (column.data.control && column.data.control in Controls) {
        const CustomControl = Controls[column.data.control] as React.FC<{ value: any }>;

        return <CustomControl value={item[attribute.logicalName]}></CustomControl>
    }

    return <>{getCellText(item, column)}</>
}

const DefaultOnBuildFetchQuery = (q: any) => q;

const Footer = () => {
    return <div>Hello</div>
}

export function ModelDrivenGridViewer(
    {
        allowNoPaging,
        locale,
        entity,
        filter,
        onChange,
        formData,
        listComponent,
        showViewSelector = true,
        newRecord,
        showRibbonBar,
        commands,
        rightCommands,
        viewName,
        recordRouteGenerator,
        padding,
        entityName, defaultValues,
        onHeaderRender,
        onBuildFetchQuery = DefaultOnBuildFetchQuery
    }: ModelDrivenGridViewerProps) {

    const app = useModelDrivenApp();
    const appinfo = useAppInfo();
    console.log("GridView: " + locale);

    const [items, setItems] = useState<IRecord[]>(newRecord ? formData[entity.collectionSchemaName.toLowerCase()] ?? [] : []);
    const selectedView = useMemo(() => viewName ?? Object.keys(entity.views ?? {})[0], [viewName]);
    const [announcedMessage, setannouncedMessage] = useState<string>();

    const [isCompactMode, setisCompactMode] = useState(false);
    // const [columns, setColumns] = useState<IColumn[]>([]);
    const attributes = useMemo(() => ({ ...((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}), ...entity.attributes }), [entityName]);
    const viewDefinition = useMemo(() => entity.views?.[selectedView], [selectedView]);
    console.log("View", [entity, viewDefinition])
    const { hideProgressBar, showIndeterminateProgressIndicator } = useProgressBarContext();

    const [isModalSelection, setisModalSelection] = useState(entity.views?.[selectedView]?.selection !== false);
    const { setSelection, selection, selectionDetails } = useSelectionContext();


    const stateCommands = useLazyMemo<ModelDrivenGridViewerState["commands"]>(() => commands?.({ selection }) ?? rightCommands ?? [], [commands, selection, selectionDetails, appinfo.currentEntityName, appinfo.currentRecordId]);

    //useEffect(() => {
    //    setCommands(commands?.({ selection }) ?? rightCommands ?? []);
    //}, [selection, selectionDetails]);

    const { buttons, addButton, removeButton, events } = useRibbon();

    useEffect(() => {
        console.log("stateCommands changed", stateCommands);
        for (let cmd of stateCommands) {
            addButton(cmd);
        }

        return () => {
            for (let cmd of stateCommands) {
                removeButton(cmd.key);
            }
        }
    }, [stateCommands]);




    //  setSelection(selection.current);






    //function _copyAndSort<T>(items: T[], columnKey: keyof T, isSortedDescending?: boolean): T[] {
    //    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[columnKey] < b[columnKey] : a[columnKey] > b[columnKey]) ? 1 : -1));
    //}

    const { fetchQuery, setFetchQuery, pageSize, currentPage, setTotalRecords, enabled: pagingContextEnabled } = usePaging();
    const pagingDisabled = useMemo(() => viewDefinition?.paging === false || (typeof (viewDefinition?.paging) === "object" && viewDefinition?.paging?.enabled === false), [viewDefinition]);

    if (!pagingContextEnabled && !(allowNoPaging || pagingDisabled))
        throw new Error(`Please wrap ModelDrivenEntityViewer with the PagingProvider or set allowNoPaging=true: pagingContextEnabled=${pagingContextEnabled}, allowNoPaging=${allowNoPaging}, pagingDisabled=${pagingDisabled}`);

    console.log("Render FetchQuery", [viewDefinition, fetchQuery]);
    const { data, isError, isLoading, mutate } = queryEntitySWR(entity, fetchQuery, !newRecord && typeof fetchQuery !== "undefined");

    useEffect(() => {

        mutate();

    }, [formData?.modifiedon]);

    //Show loading bar based on loading from data.
    useEffect(() => {
        console.log("isLoading", isLoading);
        console.log("isError", isError);
        if (isLoading && !newRecord)
            showIndeterminateProgressIndicator();
        else {
            hideProgressBar();
        }
        return () => {
            console.log("hide");
            hideProgressBar();
        }
    }, [isLoading, isError]);


    //Set items whenever its done loading and augment with entityName.
    useEffect(() => {
        console.log("setItems from data", [data, isLoading, defaultValues, fetchQuery]);

        if (data)
            setItems(data.items.map(item => Object.assign(item, { entityName: entity.logicalName })));

        if (newRecord && defaultValues) {
            setItems(defaultValues.map(item => Object.assign(item, { entityName: entity.logicalName })));

        }
    }, [data, newRecord && defaultValues]);







    //Callback to recalculate the fetchQuery.


    // KIG HER TORSDAG; HVORDAN BLIVER MODIFIED ON SAT?
    // useEffect(() => {

    //     fetchCallBack();
    // }, [formData?.modifiedon, selectedView]);
    useEffect(() => { setTotalRecords(data?.count ?? -1); }, [data?.count]);


    const user = useUserProfile();



    const hasMoreViews = Object.keys(entity?.views ?? {}).length > 1;


    const theme = useTheme();

    const _onRenderRow = useCallback<Required<IDetailsListProps>['onRenderRow']>(props => {
        const customStyles: Partial<IDetailsRowStyles> = {};

        if (props) {
            if (props.itemIndex % 2 === 0) {
                // Every other row renders with a different background color
                customStyles.root = { backgroundColor: theme.palette.neutralLighterAlt };
            }
            return <DetailsRow {...props} styles={customStyles} />;
        }
        return null;
    }, [theme.palette.neutralLighterAlt]);

    console.log("WithTimeButton Theme", theme.palette.themePrimary);

    const _onItemInvoked = (item: IRecord): void => {
        window.location.href = recordRouteGenerator(item);
    }
    console.log([showViewSelector, hasMoreViews]);




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

                <Stack.Item className={styles.gridviewWrapper} grow styles={({ root: { padding: padding } })}>

                    {showRibbonBar && ((stateCommands.length) > 0) &&
                        <RibbonBar hideBack />

                    }


                    {isModalSelection ? (
                        <ModelDrivenList
                            className="gridview"
                            items={items}
                            selectionMode={SelectionMode.multiple}
                            setKey="multiple"
                            onChange={onChange}
                            listComponent={listComponent}
                            formData={formData}
                            onRenderItemColumn={(item, index, column) => <ConditionRenderComponent
                                recordRouteGenerator={recordRouteGenerator} item={item} index={index} column={column}
                                setItems={setItems} formName={Object.keys(entity.forms ?? {})[0]}
                                attribute={attributes[column?.key!]} items={items} locale={locale} />}
                            onItemInvoked={_onItemInvoked}

                            onRenderDetailsFooter={pagingDisabled || !pagingContextEnabled ? undefined : RenderDetailsFooter}
                        />
                    ) : (
                        <ModelDrivenList
                            items={items}
                            selectionMode={SelectionMode.none}
                            setKey="none"
                            onChange={onChange}
                            formData={formData}
                            listComponent={listComponent}
                            onRenderItemColumn={(item, index, column) => <ConditionRenderComponent
                                recordRouteGenerator={recordRouteGenerator} item={item} index={index} column={column}
                                setItems={setItems} formName={Object.keys(entity.forms ?? {})[0]}
                                attribute={attributes[column?.key!]} items={items} locale={locale} />}
                            onItemInvoked={_onItemInvoked}

                            onRenderDetailsFooter={pagingDisabled || !pagingContextEnabled ? undefined : RenderDetailsFooter}
                        />
                    )}

                </Stack.Item>
            </ColumnFilterProvider>
        </Stack>

    )
}


export type ModelDrivenGridViewerContextProps = {
    onRenderPrimaryField: React.FC<{ recordRouteGenerator: (record: IRecord) => string; item: IRecord, column: IColumn }>;
}

const ModelDrivenGridViewerContext = createContext<ModelDrivenGridViewerContextProps>({ onRenderPrimaryField: ({ recordRouteGenerator, item, column }) => <Link legacyBehavior={true} href={recordRouteGenerator(item)}><a>{item[column?.fieldName!] ?? '<ingen navn>'}</a></Link> });
export function useModelDrivenGridViewerContext<T>() { return useContext<ModelDrivenGridViewerContextProps>(ModelDrivenGridViewerContext) as ModelDrivenGridViewerContextProps & T };
export function ModelDrivenGridViewerContextProvider<T>({ children, ...props }: PropsWithChildren<ModelDrivenGridViewerContextProps & T>) {
    return <ModelDrivenGridViewerContext.Provider value={props} >{children}</ModelDrivenGridViewerContext.Provider>
}

export default ModelDrivenGridViewer;