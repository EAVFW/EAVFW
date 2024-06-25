
import { PropsWithChildren, useState } from 'react';
import { TabContext } from './TabContext';





export const StateTabProvider: React.FC<PropsWithChildren<{ defaultTabs?: string[], defaultTab?:string }>> = ({ defaultTab="TAB_General", defaultTabs=[], children }) => {



    const [tabName, setSelectedTab] = useState<string>(defaultTab);
    const [tabs, setTabs] = useState(defaultTabs);


    return <TabContext.Provider value={{ tabName, onTabChange: setSelectedTab, tabs,setTabs }}> {children} </TabContext.Provider>
}
