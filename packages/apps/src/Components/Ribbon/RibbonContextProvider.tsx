import { isLookup, RibbonViewInfo } from "@eavfw/manifest";
import { ContextualMenu, DefaultButton, Dialog, DialogFooter, DialogType, ICommandBarItemProps, PrimaryButton } from "@fluentui/react";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RibbonState } from "./RibbonState";
import { useRibbon } from "./useRibbon";
import mitt, { MittEmitter } from "next/dist/shared/lib/mitt";

import { useId, useBoolean } from '@fluentui/react-hooks';
import { RibbonContext } from "./RibbonContext";

const dialogStyles = { main: { maxWidth: 450 } };
const dragOptions = {
    moveMenuItemText: 'Move',
    closeMenuItemText: 'Close',
    menu: ContextualMenu,
    keepInBounds: true,
};
const dialogContentProps = {
    type: DialogType.normal,
    title: 'Data er ikke gemt',
    closeButtonAriaLabel: 'Close',
    subText: 'Vil du gemme dine ændringer før du forlader siden?',
};


export const RibbonContextProvider: React.FC<{ defaultRibbons?: RibbonViewInfo }> = ({ children, defaultRibbons = {} }) => {

    const app = useModelDrivenApp();
    const router = useRouter();


    const [pastUrl, setPastUrl] = useState<string>();
    const confirmedRef = useRef<boolean>(false);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    const [isDraggable, { toggle: toggleIsDraggable }] = useBoolean(true);


    const labelId: string = useId('RibbonContextProviderLabel');
    const subTextId: string = useId('RibbonContextProviderSubLabel');

    const modalProps = useMemo(
        () => ({
            titleAriaId: labelId,
            subtitleAriaId: subTextId,
            isBlocking: false,
            styles: dialogStyles,
            dragOptions: isDraggable ? dragOptions : undefined,
        }),
        [isDraggable, labelId, subTextId],
    );



    const stateRef = useRef<RibbonState>({ canSave: false, skipRedirect: false, buttons: [] });
    const [ribbonState, setRibbonState2] = useState<RibbonState>(stateRef.current);
    const updateRibbonState = useCallback((state: Partial<RibbonState>) => {
        stateRef.current = { ...stateRef.current, ...state };
        console.log("updateRibbonState", stateRef.current),
            setRibbonState2(stateRef.current)
    }, []);



    const ribbonButtonsRef = useRef<ICommandBarItemProps[]>([]);
    const [ribbonButtons, setRibbonButtons] = useState<ICommandBarItemProps[]>(ribbonButtonsRef.current)

    const _addButton = (command: ICommandBarItemProps) => setRibbonButtons(ribbonButtonsRef.current = ribbonButtonsRef.current.filter(k => k.key !== command.key).concat([command])
        .sort((a, b) => (a.data?.order ?? Infinity) - (b.data?.order ?? Infinity)));
    const _removeButton = (key: string) => {
        console.log("Removing Ribbon Item: ", key);
        setRibbonButtons(ribbonButtonsRef.current = ribbonButtonsRef.current.filter(b => b.key !== key)
            .sort((a, b) => (a.data?.order ?? Infinity) - (b.data?.order ?? Infinity)));
    };


    const { events } = useRibbon();

    const ribbonEvents = events ?? useMemo(() => {
        const mitter = mitt();

        console.log("Setting up : SHOW_RIBBON_ITEM");
        const _onShow = (data: any) => {
            console.log("SHOW_RIBBON_ITEM fired", data);
            const button = ribbonButtonsRef.current.filter(k => k.key === data.type)[0];
            if (button) {
                button.disabled = false;
                setRibbonButtons(ribbonButtonsRef.current.slice());
            }
        };
        console.log("Setting up : HIDE_RIBBON_ITEM");
        const _onHide = (data: any) => {
            console.log("HIDE_RIBBON_ITEM fired", data);
            const button = ribbonButtonsRef.current.filter(k => k.key === data.type)[0];
            if (button) {
                button.disabled = true;
                setRibbonButtons(ribbonButtonsRef.current.slice());
            }


        };



        mitter.on("SHOW_RIBBON_ITEM", _onShow);
        mitter.on("HIDE_RIBBON_ITEM", _onHide);

        return mitter;
    }, []);




    //  const [oldUrl, setOldUrl] = useState<URL>();
    // prompt the user if they try and leave with unsaved changes
    useEffect(() => {

        // if (oldUrl?.href !== window.location.href)
        //                setOldUrl(new URL(window.location.href));

        //  router.
        const unsavedChanges = ribbonState.canSave;
        const warningText =
            'Du har data der ikke er gemt, er du sikker på du vil forlade siden?';
        const handleWindowClose = (e: BeforeUnloadEvent) => {
            if (!unsavedChanges) return;
            e.preventDefault();
            return (e.returnValue = warningText);
        };
        const handleBrowseAway = (url: string, props: any) => {
            console.log("handleBrowseAway", { url, props, currentUrl: router.asPath, unsavedChanges, pastUrl, confirmed: confirmedRef.current });

            const oldUrl = new URL(router.asPath, window.location.href);
            const newUrl = new URL(url, window.location.href);

            if (oldUrl.pathname === newUrl.pathname)
                return;

            if (!unsavedChanges) return;

            console.log("handleBrowseAway", [url, pastUrl, confirmedRef.current]);
            if (url === pastUrl && confirmedRef.current)
                return;

            setPastUrl(url);
            toggleHideDialog();

            console.log("handleBrowseAway: throwing");
            //  if (window.confirm(warningText)) return;
            router.events.emit('routeChangeError');
            throw 'routeChange aborted.';
        };

        window.addEventListener('beforeunload', handleWindowClose);
        router.events.on('routeChangeStart', handleBrowseAway);
        return () => {
            window.removeEventListener('beforeunload', handleWindowClose);
            router.events.off('routeChangeStart', handleBrowseAway);
        };
    }, [ribbonState.canSave, pastUrl]);




    return <>
        <Dialog
            hidden={hideDialog}
            onDismiss={toggleHideDialog}
            dialogContentProps={dialogContentProps}
            modalProps={modalProps}
        >
            <DialogFooter>
                <PrimaryButton onClick={
                    (e) => {
                        toggleHideDialog();
                        updateRibbonState({ skipRedirect: false });
                        //   setRibbonState( ribbonState.skipRedirect = true;
                        ribbonEvents.on("saveComplete", (e: any) => {
                            console.log("dialog saveCompleted", e);
                            const entityName = pastUrl?.match(/entities\/(.*?)\//)?.[1];
                            if (entityName) {
                                console.log("dialog saveCompleted", [entityName]);
                                const targetEntity = app.getEntity(entityName);
                                const currentEntity = app.getEntity(e.entityName);

                                console.log("dialog saveCompleted", [entityName, targetEntity.attributes]);
                                const lookups = Object.values(targetEntity.attributes).filter(t => isLookup(t.type) && app.getEntityFromKey(t.type.referenceType).logicalName === e.entityName)

                                console.log("dialog saveCompleted", [entityName, lookups]);
                                const newUrl = new URL(pastUrl!, window.location.href);
                                for (let lookup of lookups) {
                                    console.log("dialog saveCompleted", [entityName, lookups, lookup.logicalName, e.id]);
                                    newUrl.searchParams.set(lookup.logicalName, e.id);
                                }
                                console.log("dialog saveCompleted", [entityName, lookups, newUrl.toString()]);
                                router.push(newUrl);
                                setPastUrl(undefined);

                            } else {
                                console.log(e);
                                router.push(pastUrl!);
                            }

                        });
                        ribbonEvents.emit("onSave", e);
                    }
                } text="Gem og forsæt" />
                <DefaultButton onClick={() => { confirmedRef.current = true; updateRibbonState({ canSave: false }); toggleHideDialog(); router.push(pastUrl!); setPastUrl(undefined); }} text="Forlad side" />
            </DialogFooter>
            </Dialog>
            <RibbonContext.Provider value={({
                ...ribbonState,
                defaultRibbons,
                buttons: ribbonButtons,
                saveCompleted: (data: any) => {
                    ribbonEvents.emit("saveComplete", data);
                },
                updateState: updateRibbonState,
                addButton: _addButton,
                //        (command) => updateRibbonState({
                //    buttons: ribbonState.buttons.filter(k => k.key !== command.key
                //    ).concat([command])
                //}),
                removeButton: _removeButton,
                //    (key) => {
                //    console.log("removing " + key, {
                //        before: ribbonState.buttons,
                //        after: ribbonState.buttons.filter(b => b.key !== key)
                //    });
                //    updateRibbonState({ buttons: ribbonState.buttons.filter(b => b.key !== key) });
                //},
                events: ribbonEvents,
                registerButton: (button, deps) => {



                    useEffect(() => {

                        if (!button.onClick) {
                            button.onClick = (e) => {
                                console.log("Custom Ribbon: Clicked", [button.key, e]);

                                e?.preventDefault();
                                e?.stopPropagation();
                                ribbonEvents.emit(button.key, e);
                            }
                        }

                        console.log("useEffect: Ribbon Button", button);
                        _addButton(button);

                        return () => {
                            console.log("useEffect: Ribbon Button dispose", button);
                            _removeButton(button.key);
                        }
                    }, deps ?? []);


                }
            })
            }> {children}
                </RibbonContext.Provider>
                </>
}



    
