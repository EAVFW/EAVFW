import { ContextualMenu, Dialog, DialogFooter, DialogType } from "@fluentui/react";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { PropsWithChildren, useMemo } from "react";

export type SimpleDialogProps = {
    hideDialog: boolean
    toggleHideDialog: () => void;
}

 

export const SimpleDialog: React.FC<PropsWithChildren<SimpleDialogProps>> = ({ hideDialog, toggleHideDialog, children }) => {

    const [isDraggable, { toggle: toggleIsDraggable }] = useBoolean(true);
    const labelId: string = useId('Custom_Import_Label');
    const subTextId: string = useId('Custom_Import_SubLabel');

    const dialogContentProps = useMemo(() => ({
        type: DialogType.normal,
        title: 'Import',
        closeButtonAriaLabel: 'Close',
    }), []);
    const modalProps = useMemo(
        () => ({
            titleAriaId: labelId,
            subtitleAriaId: subTextId,
            isBlocking: false,
            styles: { main: { maxWidth: 450 } },
            dragOptions: isDraggable ? {
                moveMenuItemText: 'Move',
                closeMenuItemText: 'Close',
                menu: ContextualMenu,
                keepInBounds: true,
            } : undefined,
        }),
        [isDraggable, labelId, subTextId],
    );

    return (
        <Dialog
            hidden={hideDialog}
            onDismiss={toggleHideDialog}
            dialogContentProps={dialogContentProps}
            modalProps={modalProps}
        >
            {children}

            
             
        </Dialog>);

}