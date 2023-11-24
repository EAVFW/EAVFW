import { IRecord, isChoice } from "@eavfw/manifest";
import { ModelDrivenApp } from "../../../../ModelDrivenApp";
import { ExtensionMethods } from "@eavfw/utils";
import React from "react";
import { Views } from "../../../Views/ViewRegister";
import { ICommandBarItemProps, IIconProps } from "@fluentui/react";
import { StatusColorComponent } from "./StatusColorComponent";

export type CardObject = {
    record: IRecord;
    index: number;
    title: string;
    subTitle: string;
    cardIcon: JSX.Element;
    headerAction: JSX.Element;
    otherAttributes: { [key: string]: any };
    otherActions: OtherAction[];
};

type OtherAction = {
    title: string;
    onClick?: () => void;
    icon?: IIconProps;
    visibleOnCard?: string;
}

export class ItemToCardResolver {
    public static convertItemsToCardObjects(items: IRecord[], viewColumns: { [key: string]: any }, app: ModelDrivenApp, buttons: ICommandBarItemProps[], selection: any): CardObject[] {
        const cardObjects: CardObject[] = [];
        const iconElement = ItemToCardResolver.getElementByKey(items, app, Views, 'cardIcon');

        const otherActions = ItemToCardResolver.resolveOtherActions(items, app, buttons);

        // Iterate over items[]
        for (let i: number = 0; i < items.length; i++) {
            let item = items[i];
            let title = '';
            let subTitle = '';
            const otherAttributes: { [key: string]: any } = {};
            let statusText = "";
            let statusViewConfigObject;

            /* Columns represents the collection of properties/attributes for a given entity.
             * The code below iterates over each column in the entity and looks for definitions in a separate viewColumns object. 
             * The viewColumn object that holds attributes that decide if the current column in the scope should be displayed on the <MobileCard /> component.
             */
            const columns = app.getAttributes(item.entityName!)
            Object.entries(columns).forEach((column) => {

                const columnKey = column[0];
                const correspondingViewColumn = viewColumns[columnKey];
                /* If this condition is true, a mobile view object exists for this column and it's visible property is not set to false, so it should be displayed. */
                if (correspondingViewColumn && correspondingViewColumn?.visible !== false) {
                    let value: any;
                    if (isChoice(column[1].type)) {
                        // This is ugly. Fix if time allows for it.
                        const statusValue = item[columnKey.toLowerCase()];
                        statusViewConfigObject = correspondingViewColumn;
                        const option = Object.entries(column[1].type.options!)
                            .find(([, value]) => value === statusValue);

                        value = option ? option[0] : value;
                        statusText = value;
                    } else {
                        value = item[columnKey.toLowerCase()];
                    }

                    /* This should be updated to use more concise logic like above to resolve type from column */
                    if (ExtensionMethods.isComplexType(value)) {
                        var attributes = app.getAttributes(value.$type);
                        Object.entries(attributes).forEach(([elementKey, elementValue]) => {
                            if (elementValue.isPrimaryField) {
                                value = value[elementValue.logicalName];
                            }
                        })
                    }
                    if (correspondingViewColumn.useAsCardTitle) {
                        title = value;
                    } else if (correspondingViewColumn.useAsCardSubtitle) {
                        subTitle = value;
                    } else {
                        if (correspondingViewColumn.displayName) {
                            otherAttributes[correspondingViewColumn.displayName] = value;
                        } else {
                            otherAttributes[columnKey] = value;
                        }
                    }
                }
            });

            // Handles when no "useAsCardTitle" or "useAsCardSubtitle" is present in the configuration object.
            if (!title || !subTitle) {
                const stringKeys = Object.keys(item).filter(key => typeof item[key] === 'string' && key !== 'id');

                if (!title && stringKeys.length > 0)
                    title = item[stringKeys[0]];

                if (!subTitle && stringKeys.length > 1)
                    subTitle = item[stringKeys[1]];
            }

            const itemOtherActions = otherActions.filter(oa => filterOtherActions(oa, item)).map((otherAction) => {
                const itemOtherAction = { ...otherAction }
                const oldOnClick = otherAction.onClick;
                itemOtherAction.onClick = () => {
                    selection.selectToIndex(i, true);
                    setTimeout(() => {
                        oldOnClick?.()
                    })
                }
                return itemOtherAction
            });
            // const colorDerivedByStatus = statusViewConfigObject.options.
            // const colorOption = Object.entries(statusViewConfigObject!.options!)
            //     .find(([, value]) => value === statusValue);
            console.log("statusViewConfigObject", statusViewConfigObject!.options, statusViewConfigObject!.options[statusText].color);
            const colorOption = statusViewConfigObject!.options[statusText].color;
            const statusColor = colorOption ? colorOption : 'grey';
            const headerActionElement = React.createElement(StatusColorComponent, { color: statusColor });

            cardObjects.push({
                record: item,
                index: i,
                title,
                subTitle,
                cardIcon: iconElement,
                headerAction: headerActionElement,
                otherAttributes,
                otherActions: itemOtherActions,
            });
        }

        return cardObjects;
    }

    public static getElementByKey(items: IRecord[], app: ModelDrivenApp, Views: any, elementKey: 'cardIcon' | 'cardHeaderAction') {
        const entityName = items.find(item => item.entityName != null)?.entityName;

        if (entityName) {
            const views = app.getEntity(entityName).views;
            if (views) {
                const mobileView = Object.values(views).find(view => view.type === "mobile");

                if (mobileView) {
                    const componentKey = mobileView[elementKey];
                    if (componentKey && componentKey in Views) {
                        // console.log("ItemToCardResolver.getElementByKey(): ", Views[componentKey]());
                        return Views[componentKey]();
                    }
                }
            }
        }

        return React.createElement(React.Fragment, null);
    }


    // public static resolveOtherActions(items: IRecord[], app: ModelDrivenApp) {
    //     const entityName = items.find(item => item.entityName != null)?.entityName;
    //     if (entityName) {
    //         const views = app.getEntity(entityName).views;
    //         if (views) {
    //             const mobileView = Object.values(views).find(view => view.type === "mobile");

    //             if (mobileView) {
    //                 if (mobileView["ribbon"]) {
    //                     console.log("mobileView[\"ribbon\"]", mobileView["ribbon"]);
    //                     const elements = Object.entries(mobileView["ribbon"]).map(o => o[0]);
    //                     for (const element in elements) {
    //                         console.log("element: ", element);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }
    public static resolveOtherActions(items: IRecord[], app: ModelDrivenApp, buttons: ICommandBarItemProps[]) {
        const entityName = items.find(item => item.entityName != null)?.entityName;
        const ribbons = [];
        const otherActions: OtherAction[] = [];

        if (entityName) {
            const views = app.getEntity(entityName).views;
            if (views) {
                const mobileView = Object.values(views).find(view => view.type === "mobile");

                if (mobileView && mobileView["ribbon"]) {
                    const ribbonEntries = Object.entries(mobileView["ribbon"]);
                    for (const [key, ribbonElement] of ribbonEntries) {
                        // console.log("found ribbon with key: ", key, "and value: ", ribbonElement);

                        const buttonObject = buttons.find(b => b.key == key);
                        if (buttonObject) {
                            const otherActionObject = {
                                title: buttonObject.title ? buttonObject.title : "",
                                onClick: buttonObject.onClick,
                                icon: buttonObject.iconProps,
                                visibleOnCard: ribbonElement.visibleOnCard
                            }
                            // console.log("buttonObject: ", buttonObject, "otherActionObject: ", otherActionObject);
                            otherActions.push(otherActionObject)
                        }
                        ribbons.push(ribbonElement);
                    }
                }
            }
        }

        return otherActions;
    }

}
function filterOtherActions(oa: OtherAction, item: IRecord): unknown {
    if (!oa.visibleOnCard) {
        return true;
    }
    if (typeof oa.visibleOnCard === "string") {
        switch (oa.visibleOnCard) {
            case "@equals(record().status,50)": return item.status === 50;
            case "@equals(record().status,30)": return item.status === 30;
            default: throw new Error("Not implemented, " + oa.visibleOnCard)
        }
    }
    return oa.visibleOnCard;
}

