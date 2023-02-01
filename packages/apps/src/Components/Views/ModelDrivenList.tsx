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
import { useModelDrivenGridViewerContext } from './ModelDrivenGridViewer';

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

export type ModelDrivenListProps = {
    listComponent?: React.ComponentType<IDetailsListProps & { formData: any, onChange?: (related: any) => void }>
    onChange?: (data: any) => void
    formData?: any;
    onRenderDetailsFooter?: IRenderFunction<IDetailsFooterProps>
    onRenderItemColumn: (item?: any, index?: number, column?: IColumn) => React.ReactNode
    className?: string
    selectionMode: SelectionMode
    setKey: string,
    items: any[],
    onItemInvoked: (item: IRecord) => void
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
        <Sticky stickyPosition={StickyPositionType.Footer} isScrollSynced={true} stickyClassName="Footer">

            <Stack grow horizontal horizontalAlign="space-between">
                <Stack.Item grow className="Footer">
                    <Stack grow horizontal horizontalAlign="space-between">
                        <Stack.Item grow={1} align="center">{firstItemNumber} - {lastItemNumber} of {totalRecords} ({selectedCount} selected)</Stack.Item>
                        <Stack.Item align="center" className="FooterRight">
                            <IconButton className="FooterIcon" iconProps={{ iconName: "DoubleChevronLeft" }} onClick={moveToFirst} />
                            <IconButton className="FooterIcon" iconProps={{ iconName: "ChevronLeft" }} onClick={movePrevious} />
                            <span>Page {currentPage + 1}</span>
                            <IconButton className="FooterIcon" iconProps={{ iconName: "ChevronRight" }} onClick={moveNext} />
                        </Stack.Item>
                    </Stack>
                </Stack.Item>
            </Stack>

        </Sticky>
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


   
export function ModelDrivenList(
    { onChange,
        formData,
        listComponent,
        onRenderDetailsFooter,
        onItemInvoked,
        onRenderItemColumn,
        className,
        selectionMode,
        setKey,
        items
    }: ModelDrivenListProps) {
    const [isCompactMode, setisCompactMode] = useState(false);

    const { setSelection, selection, selectionDetails } = useSelectionContext();
    const [ { columns } ] = useColumnFilter()
  
   

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

    const localColumns = useMemo(() => columns?.filter(c => c.data.visible !== false)??[], [columns]);

    console.log("ModelDrivenList", localColumns);
    if (!localColumns?.length)
        return <div>loading data</div>

    const ListComponent = listComponent ?? DetailsList;

    return (
        <ListComponent className={className} styles={{ headerWrapper: { paddingTop: 0 }, focusZone: { paddingTop: 0 } }}
            constrainMode={ConstrainMode.unconstrained}
            items={items}
            compact={isCompactMode}
            columns={localColumns}
            selectionMode={selectionMode}
            getKey={_getKey}
            setKey={setKey}
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            selection={selection}
            selectionPreservedOnEmptyClick={true}
            enterModalSelectionOnTouch={true}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
            checkButtonAriaLabel="select row"

            onItemInvoked={onItemInvoked}
            onRenderRow={_onRenderRow}
            onRenderDetailsHeader={onRenderDetailsHeader}
            onChange={onChange}
            formData={formData}
            onRenderItemColumn={onRenderItemColumn}

            onRenderDetailsFooter={onRenderDetailsFooter}
        />


    )
}

export default ModelDrivenList;