import { ReactNode, useMemo } from "react";
import { RibbonButtonProps } from "./RibbonButtonProps";
import { RibbonButtons } from "./RibbonButtons";
import { useRibbon } from "./useRibbon";

export const RibbonHost: React.FC<{ ribbon: { [key: string]: Partial<RibbonButtonProps> } }> = ({ ribbon, children }) => {

    const { registerButton } = useRibbon();

   
    console.groupCollapsed("Ribbonhost: " + Object.keys(ribbon).join());
    console.log(ribbon);
  
        try {
            let elements = [] as ReactNode[];
            let contexts = [] as Array<React.FC>;
            for (let [ribbonKey, props] of Object.entries(ribbon)
                //  .filter(([ribbonKey, props]) => ribbonKey in RibbonButtons)
            ) {
                if (ribbonKey in RibbonButtons) {
                    console.log("Setting up ribbon v2 for " + ribbonKey);
                    let element = RibbonButtons[ribbonKey]?.(props);
                    if (element) {
                        if (Array.isArray(element)) {
                            elements.push(element[0]);
                            for (let j = 1; j < element.length; j++)
                                contexts.push(element[j]);
                        } else {
                            elements.push(element);
                        }
                    }
                } else {

                    registerButton({
                        key: ribbonKey,
                        ...props
                    });
                }
            }
            console.log("Render Ribbon V2:", [contexts, elements, children]);

            if (contexts.length) {
                let q = contexts.slice();
                let childrenNode = <>
                    {elements}
                    {children}
                </>;

                while (q.length) {
                    let Context = q.pop()!;

                    childrenNode = <Context >{childrenNode}</Context>;
                }
                return childrenNode;
            }

            return <>
                {elements}
                {children}
            </>


        } finally {
            console.groupEnd();
        }
    
};