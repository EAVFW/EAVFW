import { ReactNode } from "react";
import { RibbonButtonProps } from "./RibbonButtonProps";
import { RibbonButtons } from "./RibbonButtons";
import { useRibbon } from "./useRibbon";

export const RibbonHost: React.FC<{ ribbon: { [key: string]: Partial<RibbonButtonProps> } }> = ({ ribbon, children }) => {

    const { registerButton } = useRibbon();

   
    console.groupCollapsed("Ribbonhost: " + Object.keys(ribbon).join());
    console.log(ribbon);
    try {
        let elements = [] as ReactNode[];
        for (let [ribbonKey, props] of Object.entries(ribbon)
            //  .filter(([ribbonKey, props]) => ribbonKey in RibbonButtons)
        )
        {
            if (ribbonKey in RibbonButtons) {
                console.log("Setting up ribbon for " + ribbonKey);
                let element = RibbonButtons[ribbonKey]?.(props);
                if (element) {
                    elements.push(element);
                }
            } else {
                
                registerButton({
                    key: ribbonKey,
                    ...props
                });
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