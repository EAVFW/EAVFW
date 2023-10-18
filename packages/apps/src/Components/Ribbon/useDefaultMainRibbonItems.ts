
import { isLookup, RibbonViewInfo, deleteRecordSWR } from "@eavfw/manifest";
import { ICommandBarItemProps } from "@fluentui/react";
import { useEffect } from "react";
import { useAppInfo } from "../../useAppInfo";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { useSelectionContext } from "../Selection/useSelectionContext";
import { useRibbon} from "./useRibbon"
import { capitalize} from "@eavfw/utils";
import { useFormLayoutContext } from "../..";

function uuidv4() {
    //@ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export const useDefaultMainRibbonItems = (ribbonInfo: RibbonViewInfo = {}, pushRoute: (url: URL) => void, withSave=true) => {

    const { addButton, removeButton, canSave, events } = useRibbon();
    const app = useModelDrivenApp();
    const appInfo = useAppInfo();

    const { selection, selectionDetails } = useSelectionContext();
    const { drawer } = useFormLayoutContext();

    // const router = useRouter();

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

                        drawer.open(wizards[0]);
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