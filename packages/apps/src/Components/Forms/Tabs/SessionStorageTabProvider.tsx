
import { useState } from "react";
import { TabContext } from "./TabContext";


export const SessionStorageTabProvider: React.FC<{ key: string, defaultTabs: string[] }> = ({ children, key, defaultTabs }) => {



    const [tabName, setSelectedTab] = useState<string>(sessionStorage.getItem(key) ?? "");
    const [tabs, setTabs] = useState(defaultTabs);
    const onTabChange = (tabName: string) => {


        if (tabName)
            sessionStorage.setItem(key, tabName);
        setSelectedTab(tabName);
    }


    return <TabContext.Provider value={{ tabName, onTabChange, tabs, setTabs }}> {children} </TabContext.Provider>
}