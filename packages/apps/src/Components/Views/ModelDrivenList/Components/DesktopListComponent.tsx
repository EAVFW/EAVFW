import React, { useCallback, useMemo } from 'react';

import {
    DetailsList,
    DetailsListLayoutMode,
    SelectionMode,
    IColumn,
    IDetailsFooterProps,
    IRenderFunction,
    StickyPositionType,
    IDetailsHeaderProps,
    IDetailsColumnRenderTooltipProps,
    TooltipHost,
    Sticky,
    DetailsRow,
    IDetailsRowStyles,
    IDetailsListProps,
    ConstrainMode,
    useTheme,
} from "@fluentui/react";
import { IRecord } from '@eavfw/manifest';
import { useColumnFilter } from '../../../ColumnFilter/ColumnFilterContext';
import { useSelectionContext } from '../../../Selection/useSelectionContext';

export type ModelDrivenListProps = {
    onChange?: (data: any) => void
    onItemInvoked: (item: IRecord) => void
    onRenderItemColumn: (item?: any, index?: number, column?: IColumn) => React.ReactNode
    onRenderDetailsFooter?: IRenderFunction<IDetailsFooterProps>
    formData?: any;
    className?: string
    selectionMode: SelectionMode
    setKey: string,
    items: any[],
}

export const DesktopListComponent: React.FC<ModelDrivenListProps> = ({ onChange, formData, onRenderDetailsFooter, onItemInvoked, onRenderItemColumn, className, selectionMode, setKey, items }: ModelDrivenListProps) => {

    const { selection } = useSelectionContext();
    const [{ columns }] = useColumnFilter();
    const { palette } = useTheme();

    const _onRenderRow = useCallback<Required<IDetailsListProps>['onRenderRow']>(props => {
        const customStyles: Partial<IDetailsRowStyles> = {};

        if (props) {
            if (props.itemIndex % 2 === 0) {
                // Every other row renders with a different background color
                customStyles.root = { backgroundColor: palette.neutralLighterAlt };
            }
            return <DetailsRow {...props} styles={customStyles} />;
        }
        return null;
    }, [palette.neutralLighterAlt]);

    function _getKey(item: any, index?: number): string {
        return item.key;
    }

    const localColumns = useMemo(() => columns?.filter(c => c.data.visible !== false) ?? [], [columns]);
    if (!localColumns?.length) return <div>loading data</div>;
    console.log("Displaying <DesktopListComponent />");

    return (
        <DetailsList
            className={className}
            styles={{ headerWrapper: { paddingTop: 0 }, focusZone: { paddingTop: 0 } }}
            constrainMode={ConstrainMode.unconstrained}
            items={items}
            compact={false}
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
            onRenderItemColumn={onRenderItemColumn}
            onRenderDetailsFooter={onRenderDetailsFooter}
        />
    )
}

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