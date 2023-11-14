import { AttributeDefinition } from "@eavfw/manifest";
import { Action } from "./MobileCard";
import { useModelDrivenApp } from "../../../../useModelDrivenApp";
import { ExtensionMethods } from "@eavfw/utils";

export type CardObject = {
    title: string;
    subTitle: string;
    headerAction: JSX.Element;
    otherAttributes: { [key: string]: any };
    otherActions: Action[];
};

export class ColumnResolver {
    public static convertItemsToCardObjects(columns: { [key: string]: any }, viewColumns: { [key: string]: any }): CardObject[] {
        const cardObjects: CardObject[] = []; // Initialize an empty array to hold CardObject instances

        // Iterate over the columns object
        for (const [columnName, columnValue] of Object.entries(columns)) {
            let title = '';
            let subTitle = '';
            const otherAttributes: { [key: string]: any } = {};
            const app = useModelDrivenApp();

            console.log("columns: ", columns, "viewColumns: ", viewColumns)

            // Process each attribute (column) based on the viewColumns configuration
            Object.entries(viewColumns).forEach(([columnKey, columnConfig]) => {
                let value = columnValue[columnKey.toLowerCase()]; // Convert columnKey to lowercase to match columns casing
                // const attribute = columnValue[columnKey.toLowerCase()].data as AttributeDefinition;
                if (columnConfig.visible !== false) {
                    if (ExtensionMethods.isComplexType(value)) {
                        console.log("KBA-column-isComplex: ", value);
                        console.log("KBA-column-columnKeyComplex", columnKey.toLowerCase());
                        value = app.getPrimaryField(columnKey.toLowerCase());
                        console.log("KBA-column-getPrimaryField: ", value);
                    }
                    console.log("KBA-columnKey: ", columnKey);
                    console.log("KBA-columnConfig", columnConfig);
                    console.log("KBA-columnValue: ", columnValue);
                    // console.log("KBA-columnattribute: ", attribute);
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
                const stringKeys = Object.keys(columnValue).filter(key => typeof columnValue[key] === 'string' && key !== 'id');

                if (!title && stringKeys.length > 0) {
                    title = columnValue[stringKeys[0]];
                }

                if (!subTitle && stringKeys.length > 1) {
                    subTitle = columnValue[stringKeys[1]];
                }
            }

            // Create a CardObject for the current column and push it into the cardObjects array
            cardObjects.push({
                title,
                subTitle,
                headerAction: <JSX.Element>{}, // You need to define how you want to create this JSX.Element
                otherAttributes,
                otherActions: [] as Action[], // You need to define how you want to create these Actions
            });
        }

        return cardObjects;
    }
}
