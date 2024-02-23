
import { PropsWithChildren, useState } from 'react';
import { TabContext } from './TabContext';





export const StateTabProvider: React.FC<PropsWithChildren<{ defaultTabs: string[] }>> = ({ defaultTabs, children }) => {



    const [tabName, setSelectedTab] = useState<string>("");
    const [tabs, setTabs] = useState(defaultTabs);


    return <TabContext.Provider value={{ tabName, onTabChange: setSelectedTab, tabs,setTabs }}> {children} </TabContext.Provider>
}
