import { PropsWithChildren, ReactNode, useMemo } from "react";
import { RibbonButtonProps } from "./RibbonButtonProps";
import { RibbonButtons } from "./RibbonButtons";
import { useRibbon } from "./useRibbon";

export const RibbonHost: React.FC<PropsWithChildren<{ ribbon: { [key: string]: Partial<RibbonButtonProps> } }>> = ({ ribbon, children }) => {

    const { registerButton } = useRibbon();

    try {
        let elements = [] as ReactNode[];
        let contexts = [] as Array<React.FC<PropsWithChildren>>;
        for (let [ribbonKey, props] of Object.entries(ribbon)
            //  .filter(([ribbonKey, props]) => ribbonKey in RibbonButtons)
        ) {
            props.key = ribbonKey;
            if (ribbonKey in RibbonButtons) {

                let element = RibbonButtons[ribbonKey]?.(props);
                if (element) {
                    if (Array.isArray(element)) {
                        let RibbonElement = element[0];
                        elements.push(typeof (RibbonElement) === "function" ? <RibbonElement key={ribbonKey} {...props} /> : RibbonElement);
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
                },[props]);
            }
        }

        if (contexts.length) {
            let q = contexts.slice();
            let childrenNode = <>
                {elements}
                {children}
            </>;

            while (q.length) {
                let Context = q.pop()!;

                childrenNode = <Context>{childrenNode}</Context>;
            }
            return <>{childrenNode}</>;
        }

        return <>
            {elements}
            {children}
        </>

    } finally {
    }

};