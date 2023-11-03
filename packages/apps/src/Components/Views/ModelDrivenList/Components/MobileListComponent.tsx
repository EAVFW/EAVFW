import React from 'react';
import { SelectionMode, IColumn } from "@fluentui/react";
import { IRecord } from '@eavfw/manifest';
import { useSelectionContext } from '../../../Selection/useSelectionContext';

export type MobileListComponentProps = {
    onItemInvoked: (item: IRecord) => void
    onRenderItemColumn: (item?: any, index?: number, column?: IColumn) => React.ReactNode
    className?: string
    selectionMode: SelectionMode
    items: any[]
}

export const MobileListComponent: React.FC<MobileListComponentProps> = ({
    onItemInvoked,
    onRenderItemColumn,
    className,
    selectionMode,
    items
}) => {
    const { selection } = useSelectionContext();

    const handleItemClick = (item: IRecord) => {
        // Only invoke the item if selection mode is none, 
        // otherwise, selection should handle the click
        if (selectionMode === SelectionMode.none) {
            onItemInvoked(item);
        }
    };

    console.log("Displaying <MobileListComponent />");

    return (
        <div className={className}>
            {items.map((item, index) => (
                <div key={item.key} onClick={() => handleItemClick(item)}>
                    {onRenderItemColumn(item, index,)}
                </div>
            ))}
        </div>
    );
};

export default MobileListComponent;
