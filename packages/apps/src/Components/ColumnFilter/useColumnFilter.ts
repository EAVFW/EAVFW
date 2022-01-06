import { IColumn, Target } from "@fluentui/react";
import { useState } from "react";


/**
 * Bundles states together, which are relevant for this component.
 */
export function useColumnFilter() {
    const [menuTarget, setMenuTarget] = useState<Target>();

    const [isCalloutVisible, setIsCalloutVisible] = useState(false);

    const [currentColumn, setCurrentColumn] = useState<IColumn>();


    return {
        menuTarget: menuTarget,
        setMenuTarget: setMenuTarget,
        isCalloutVisible: isCalloutVisible,
        toggleCalloutVisible: () => {
            setIsCalloutVisible(x => !x)
        },
        currentColumn: currentColumn,
        setCurrentColumn: setCurrentColumn
    };
}
