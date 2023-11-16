import { IRecord } from "@eavfw/manifest";
import { Action } from "./MobileCard";
import { useModelDrivenApp } from "../../../../useModelDrivenApp";
import { ExtensionMethods } from "@eavfw/utils";
import React from "react";
import { ModelDrivenApp } from "index";
import { Views } from "../../../Views/ViewRegister";
import { values } from "@fluentui/react";

export type CardObject = {
    record: IRecord;
    title: string;
    subTitle: string;
    cardIcon: JSX.Element;
    headerAction: JSX.Element;
    otherAttributes: { [key: string]: any };
    otherActions: Action[];
};

export class ItemToCardResolver {
    public static convertItemsToCardObjects(items: IRecord[], viewColumns: { [key: string]: any }, app: ModelDrivenApp): CardObject[] {
        const cardObjects: CardObject[] = [];


        let iconElement = React.createElement(React.Fragment, null);
        var headerActionElement: JSX.Element = React.createElement(React.Fragment, null);
        var entityName = items.find(i => i.entityName !== null && i.entityName !== undefined)?.entityName;
        if (typeof entityName !== "undefined" && entityName) {
            const views = app.getEntity(entityName).views;
            if (views) {
                const mobileViewEntry = Object.entries(views).find(([key, value]) => value.type === "mobile");
                const mobileView = mobileViewEntry && mobileViewEntry[1];
                console.log("viewsObject: ", views, "mobileView: ", mobileView);

                if (mobileView) {
                    const iconComponentKey = mobileView.cardIcon && mobileView.cardIcon.toString();
                    if (iconComponentKey && iconComponentKey in Views) {
                        iconElement = Views[iconComponentKey]("red");
                        console.log("iconComponentKey: ", iconComponentKey, "Views[iconComponentKey]: ", Views[iconComponentKey]);
                    }
                    const headerActionComponentKey = mobileView.cardHeaderAction && mobileView.cardHeaderAction.toString();
                    if (headerActionComponentKey && headerActionComponentKey in Views) {
                        headerActionElement = Views[headerActionComponentKey]();
                    }
                }
            }
        }


        // Iterate over items[]
        for (const item of items) {
            let title = '';
            let subTitle = '';
            const otherAttributes: { [key: string]: any } = {};
            console.log("viewColumns: ", viewColumns);

            Object.entries(viewColumns).forEach(([columnKey, columnConfig]) => {
                let value = item[columnKey.toLowerCase()]; // Convert columnKey to lowercase to match columns casing
                if (columnConfig.visible !== false) {
                    if (ExtensionMethods.isComplexType(value)) {
                        // console.log("###KBA: Attempting to find primaryField for entity: ", value, "with key: ", columnKey, "and type: ", value.$type);
                        console.log("View available: ", columnConfig);
                        var attributes = app.getAttributes(value.$type);
                        // console.log("###KBA: attr: ", attributes);
                        Object.entries(attributes).forEach(([elementKey, elementValue]) => {
                            if (elementValue.isPrimaryField) {
                                // console.log("###KBA: Found primaryField for entity: ", value, "primaryField: ", elementValue);
                                value = value[elementValue.logicalName];
                                // console.log("####KBA: value set to: ", value);
                            }
                        })
                    }
                    if (columnConfig.useAsCardTitle) {
                        title = value;
                    } else if (columnConfig.useAsCardSubtitle) {
                        subTitle = value;
                    } else {
                        // If attribute != title, subtitle add to otherAttributes.
                        otherAttributes[columnKey] = value;
                    }
                }
            });

            // Handles when no "useAsCardTitle" or "useAsCardSubtitle" is present in the configuration object.
            if (!title || !subTitle) {
                const stringKeys = Object.keys(item).filter(key => typeof item[key] === 'string' && key !== 'id');

                if (!title && stringKeys.length > 0) {
                    title = item[stringKeys[0]];
                }

                if (!subTitle && stringKeys.length > 1) {
                    subTitle = item[stringKeys[1]];
                }
            }

            cardObjects.push({
                record: item,
                title,
                subTitle,
                cardIcon: iconElement,
                headerAction: headerActionElement,
                otherAttributes,
                otherActions: [] as Action[],
            });
        }

        return cardObjects;
    }

    public static resolveCardIcon = () => {

    }
    public static resolveStatus = (status: number) => {
        switch (status) {
            case 0:
                return 'New';
            case 10:
                return 'Sent';
            case 20:
                return 'Opened';
            case 30:
                return 'Filled';
            case 40:
                return 'Approved';
            case 50:
                return 'Signed';
            case 60:
                return 'Sent to captain';
            case 400:
                return 'Archived';
            default:
                return 'N/A';
        }
    };
}
