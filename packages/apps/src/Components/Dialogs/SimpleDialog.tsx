//import { ContextualMenu, Dialog, DialogFooter, DialogType } from "@fluentui/react";
import { Button, ButtonProps, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Spinner } from "@fluentui/react-components";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { MouseEventHandler, PropsWithChildren, useMemo } from "react";

export type SimpleDialogPrimaryButtonProps = ButtonProps & {
   // onOkClick?: MouseEventHandler<HTMLButtonElement>;
   // children?: string;
    spinning?: boolean;
    
}
export type SimpleDialogProps = {
    hideDialog: boolean
    toggleHideDialog: () => void;
    maxWidth?: number | string;
    minWidth?: number | string;
    title?: string;
    onCancelText?: string;
    primaryButton?: SimpleDialogPrimaryButtonProps
}



export const SimpleDialog: React.FC<PropsWithChildren<SimpleDialogProps>> = ({ title = "Import", maxWidth = 450,
    hideDialog, toggleHideDialog, children, minWidth = "60vw", primaryButton: { spinning = false, ...primaryButton } = {}, onCancelText = "Cancel" }) => {

   // const [isDraggable, { toggle: toggleIsDraggable }] = useBoolean(true);
    //const labelId: string = useId('Custom_Import_Label');
  //  const subTextId: string = useId('Custom_Import_SubLabel');

    //const dialogContentProps = useMemo(() => ({
    //    type: DialogType.normal,
    //    title: title,
    //    closeButtonAriaLabel: 'Close',
    //}), []);
    //const modalProps = useMemo(
    //    () => ({
    //        titleAriaId: labelId,
    //        subtitleAriaId: subTextId,
    //        isBlocking: false,
    //        styles: { main: { maxWidth, minHeight: "80vh" } },
    //        dragOptions: isDraggable ? {
    //            moveMenuItemText: 'Move',
    //            closeMenuItemText: 'Close',
    //            menu: ContextualMenu,
    //            keepInBounds: true,
    //        } : undefined,
    //    }),
    //    [isDraggable, labelId, subTextId, maxWidth],
    //);

    //return (
    //    <Dialog minWidth={minWidth}
    //        hidden={hideDialog}
    //        onDismiss={toggleHideDialog}
    //        dialogContentProps={dialogContentProps}
    //        modalProps={modalProps}
    //    >
    //        {children}




    //    </Dialog>);

    return (
        <Dialog open={!hideDialog}>
            <DialogSurface style={{ minWidth: minWidth }}>
                <DialogBody style={{ minHeight: "80vh" }}>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        {children}
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={toggleHideDialog} disabled={spinning}>{onCancelText}</Button>
                        <Button appearance="primary" {...primaryButton} >{spinning && < Spinner style={{ marginRight: "1rem" }} />}{primaryButton.children}</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>

    )

}