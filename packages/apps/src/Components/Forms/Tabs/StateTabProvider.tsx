import { IPivotProps, PivotItem } from '@fluentui/react';
import { useState } from 'react';
import { TabContext } from './TabContext';





export const StateTabProvider: React.FC = ({ children }) => {



    const [tabName, setSelectedTab] = useState<string>("");
    const onTabChange = (e?: PivotItem, ee?: any) => {

        setSelectedTab(e?.props.itemKey!);
    }


    return <TabContext.Provider value={ { tabName, onTabChange } }> { children } </TabContext.Provider>
}
