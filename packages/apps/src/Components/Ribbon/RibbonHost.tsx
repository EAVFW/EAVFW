import { ReactNode } from "react";
import { RibbonButtonProps } from "./RibbonButtonProps";
import { RibbonButtons } from "./RibbonButtons";

export const RibbonHost: React.FC<{ ribbon: { [key: string]: Partial<RibbonButtonProps> } }> = ({ ribbon, children }) => {

    console.groupCollapsed("Ribbonhost: " + Object.keys(ribbon).join());
    try {
        let elements = [] as ReactNode[];
        for (let [ribbonKey, props] of Object.entries(ribbon).filter(([ribbonKey, props]) => ribbonKey in RibbonButtons)) {
            console.log("Setting up ribbon for " + ribbonKey);
            let element = RibbonButtons[ribbonKey]?.(props);
            if (element) {
                elements.push(element);
            }
        }

        return <>
            {elements}
            {children}
        </>
    } finally {
        console.groupEnd();
    }
};