
import { isLookup, RibbonViewInfo, deleteRecordSWR } from "@eavfw/manifest";
import { ICommandBarItemProps } from "@fluentui/react";
import { useEffect, useMemo } from "react";
import { useAppInfo } from "../../useAppInfo";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { useSelectionContext } from "../Selection/useSelectionContext";
import { useRibbon} from "./useRibbon"
import { capitalize} from "@eavfw/utils";
import { useFormLayoutContext } from "../..";
import { useWizard, useWizardOpener } from "../Wizards/useWizard";
import { RibbonViewItemInfo } from "@eavfw/manifest/src/Ribbon/RibbonViewItemInfo";

function uuidv4() {
    //@ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

const useWizardRibbonButtons = () => {
    const app = useModelDrivenApp();
    const appInfo = useAppInfo();
    const wizards = useMemo(() => app.getWizardsTriggeredByRibbons(appInfo.currentAppName, appInfo.currentAreaName, appInfo.currentEntityName),
        [appInfo.currentAppName, appInfo.currentAreaName, appInfo.currentEntityName]);

    const { addButton, removeButton, canSave, events } = useRibbon();
    const { openWizard } = useWizardOpener();
    useEffect(() => {
        const keys : string[] = [];
        for (let [key, wizard, triggers] of wizards) {
            for (let [triggerKey, trigger] of triggers) {

                if (trigger.visibleForForms === false && appInfo.currentRecordId)
                    continue;

                addButton({
                    ...trigger.ribbon as RibbonViewItemInfo,
                    key: key,
                    text: capitalize(app.getLocalization(triggerKey) ?? triggerKey),
                    
                    
                    onClick: (e, i) => {
                        openWizard([key, wizard]);
                    }
                });
                keys.push(key);
            }
        }

        return () => {
            for (let key of keys) {
               
                    removeButton(key);
                
            }
        }
    }, [wizards, appInfo.currentRecordId]);
}
const useNewRibbonButton = (ribbonInfo: RibbonViewInfo, pushRoute: (url: URL) => void) => {
    const app = useModelDrivenApp();
    const appInfo = useAppInfo();
    const { addButton, removeButton, canSave, events } = useRibbon();
    const { openWizard } = useWizardOpener();
    useEffect(() => {
        let items: ICommandBarItemProps[] = [];

        if (ribbonInfo.new?.visible !== false) {
            addButton({
                key: 'newItem',
                text: capitalize(app.getLocalization("new") ?? 'New'),
                iconProps: { iconName: 'Add' }, data: { order: 0 },
                onClick: (e, i) => {

                    const wizards = app.getWizardsTriggeredByNew(appInfo.currentAppName, appInfo.currentAreaName, appInfo.currentEntityName);
                    if (wizards.length > 0) {

                        openWizard(wizards[0]);
                        return;
                    }

                    const url = new URL(app.newEntityUrl(appInfo.currentAppName, appInfo.currentAreaName, appInfo.currentEntityName), location.href);
                    const oldUrl = new URL(location.href);
                    console.log(url);
                    for (let p of oldUrl.searchParams) {

                        if (p[0] === "tabName")
                            continue;

                        url.searchParams.set(p[0], p[1]);
                    }
                    pushRoute(url);
                    //  router.push(url);
                },
            });
        }

        return () => {

            removeButton('newItem');

        }

    }, [ribbonInfo.new?.visible, appInfo.currentAppName, appInfo.currentAreaName, appInfo.currentEntityName]);


}

const useSaveRibbonButton = (withSave: boolean) => {
    const app = useModelDrivenApp();
    const { addButton, removeButton, canSave, events } = useRibbon();
    useEffect(() => {
        if (withSave) {
            addButton(
                {
                    key: 'saveItem',
                    cacheKey: uuidv4(),
                    text: capitalize(app.getLocalization("save") ?? 'Save'),
                    iconProps: { iconName: 'Save' },
                    disabled: !canSave,
                    data: { order: 1 },
                    onClick: (e, i) => {
                        console.log("Saving");
                        events.emit("onSave", e);
                    },
                    split: true,
                    ariaLabel: 'Save',
                    subMenuProps: {
                        items: [
                            {
                                key: 'newItem',
                                text: capitalize(app.getLocalization('SaveAndClose') ?? 'Save and Close'),
                                iconProps: { iconName: 'Save' },
                                onClick: (e, i) => {
                                    console.log("Saving and closing");
                                    events.emit("onSaveAndClose", e);
                                },
                            },
                        ],
                    },
                });

            return () => {
                removeButton('saveItem');

            }
        }


    }, [canSave]);
}
const useDeleteRibbonButton = (ribbonInfo: RibbonViewInfo) => {
    const app = useModelDrivenApp();
    const { addButton, removeButton, canSave, events } = useRibbon();
    const { selection, selectionDetails } = useSelectionContext();
    useEffect(() => {
        console.log("ribbonInfo", ribbonInfo);
        if (ribbonInfo.delete?.visible !== false) {
            addButton({
                key: 'deleteItem',
                text: capitalize(app.getLocalization("Delete") ?? 'Delete'),
                iconProps: { iconName: 'Delete' }, data: { order: 2 },
                disabled: ribbonInfo.delete?.disabled || selection.count === 0,
                onClick: (e, i) => {


                    setTimeout(async () => {
                        let tasks = selection.getSelection().map(i => deleteRecordSWR(app.getEntity(i.entityName!), i.id!));
                        await Promise.all(tasks);

                        location.reload();
                    });

                },
            });
        }

        return () => {

            removeButton('deleteItem');
        }

        //    return items;
        // }, [ribbonState.new?.visible]);
        // return items;

    }, [ribbonInfo.delete?.visible, ribbonInfo.delete?.disabled, selection, selectionDetails]);

}
export const useDefaultMainRibbonItems = (ribbonInfo: RibbonViewInfo = {}, pushRoute: (url: URL) => void, withSave=true) => {
     
    useNewRibbonButton(ribbonInfo, pushRoute);
    
    useSaveRibbonButton(withSave)

    useDeleteRibbonButton(ribbonInfo);

    useWizardRibbonButtons();
}