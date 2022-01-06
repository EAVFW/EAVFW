import { PivotItem } from "@fluentui/react";
import { useState } from "react";
import { TabContext } from "./TabContext";


export const SessionStorageTabProvider: React.FC<{ key: string }> = ({ children, key }) => {



    const [tabName, setSelectedTab] = useState<string>(sessionStorage.getItem(key) ?? "");
    const onTabChange = (e?: PivotItem, ee?: any) => {


        if (e?.props.itemKey)
            sessionStorage.setItem(key, e?.props.itemKey);
        setSelectedTab(e?.props.itemKey!);
    }


    return <TabContext.Provider value={{ tabName, onTabChange }}> {children} </TabContext.Provider>
}